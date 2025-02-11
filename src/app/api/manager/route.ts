import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { supabaseService } from '@/lib/services/supabase';
import {
  getSystemPrompt,
  generateTradePrompt,
} from '@/lib/prompts/trade-generator';
import { tradeRecommendationSchema } from '@/lib/schemas/trade-recommendation';
import { base as baseAgents } from '@/lib/agents';

interface Token {
  token: {
    balance: string;
    balanceUSD: string;
    baseToken: {
      address: string;
      symbol: string;
      price?: number;
    };
  };
}

interface PortfolioToken {
  contract_address: string;
  balance: string;
  balanceUSD: string;
  symbol: string;
}

export async function GET() {
  try {
    const { data: agents, error } = await supabaseService
      .from('agents')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Supabase error:', error);
      return Response.json(
        { error: 'Failed to fetch agents' },
        { status: 500 }
      );
    }

    if (!agents || agents.length === 0) {
      return Response.json({ error: 'No agents found' }, { status: 404 });
    }

    if (!process.env.ZAPPER_API_KEY) {
      console.error('Zapper API key is not configured');
      return Response.json(
        { error: 'Zapper API is not configured' },
        { status: 500 }
      );
    }

    const query = `
query GetCompletePortfolio($addresses: [Address!]!) {
  portfolio(addresses: $addresses) {
    tokenBalances {
      address
      token {
        balanceUSD
        baseToken {
          address
          symbol
        }
        balance
      }
    }
  }
}
  `;

    const encodedKey = Buffer.from(process.env.ZAPPER_API_KEY).toString(
      'base64'
    );

    const response = await fetch('https://public.zapper.xyz/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${encodedKey}`,
        Accept: 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: {
          addresses: ['0x9ce10cd2916b74BF078D935b005dcf6E6147b598'],
        },
      }),
    });

    if (!response.ok) {
      console.error('Zapper API error:', await response.text());
      return Response.json(
        { error: 'Failed to fetch portfolio data' },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (data.errors) {
      console.error('GraphQL errors:', data.errors);
      return Response.json(
        { error: 'GraphQL query failed', details: data.errors },
        { status: 400 }
      );
    }

    console.log('Portfolio data:', data);

    const portfolio = data.data.portfolio.tokenBalances
      .map((token: Token) => {
        if (!token?.token?.baseToken) {
          console.warn('Invalid token data structure:', token);
          return null;
        }

        return {
          contract_address: token.token.baseToken.address.toLowerCase(),
          balance: token.token.balance || '0',
          balanceUSD: token.token.balanceUSD || '0',
          symbol: token.token.baseToken.symbol || 'UNKNOWN',
          price: token.token.baseToken.price || 0,
        };
      })
      .filter(Boolean);

    // Find portfolio tokens that match baseAgents
    const matchingTokens = portfolio.filter((token: PortfolioToken) =>
      baseAgents
        .map((addr) => addr.toLowerCase())
        .includes(token.contract_address)
    );

    console.log('matchingTokens', matchingTokens);

    if (matchingTokens.length === 0) {
      return Response.json({
        recommendations: [],
        execution_results: [],
        message: 'No portfolio tokens match baseAgents list',
      });
    }

    // Get agent data for matching tokens
    const matchingAgents = await Promise.all(
      matchingTokens.map(async (token: PortfolioToken) => {
        const { data: agentData } = await supabaseService
          .from('agents')
          .select('*')
          .eq('contract_address', token.contract_address)
          .single();

        return {
          ...agentData,
          balance: token.balance,
          balanceUSD: token.balanceUSD,
          symbol: token.symbol,
        };
      })
    );

    console.log('matchingAgents', matchingAgents);

    // Generate sell recommendations
    const { object: recommendations } = await generateObject({
      model: openai('gpt-4o-mini'),
      schema: tradeRecommendationSchema,
      system: getSystemPrompt(),
      prompt: generateTradePrompt(matchingAgents),
    });

    // Filter for HIGH conviction SELL recommendations
    const sellRecommendations = recommendations.recommendations.filter(
      (rec) =>
        rec.trade.trade_action === 'SELL' &&
        rec.trade.conviction_level === 'HIGH'
    );

    if (sellRecommendations.length === 0) {
      return Response.json({
        recommendations: [],
        execution_results: [],
        message: 'No high conviction sell recommendations generated',
      });
    }

    console.log('sellRecommendations', sellRecommendations);

    // Prepare trades for execution
    const trades = await Promise.all(
      sellRecommendations.map(async (recommendation) => {
        const matchingAgent = matchingAgents.find(
          (agent) =>
            agent.contract_address === recommendation.trade.token_contract
        );

        if (!matchingAgent) {
          return {
            status: 'failed',
            error: 'No matching agent found for trade',
            recommendation,
          };
        }

        const tradeId = crypto.randomUUID();

        // Save trade to database
        const tradeData = {
          trade_id: tradeId,
          contract_address: recommendation.trade.token_contract,
          trade_action: 'SELL',
          amount: matchingAgent.balance,
          status: 'PENDING',
          justification: recommendation.justification,
          created_at: new Date().toISOString(),
        };

        const { error: saveError } = await supabaseService
          .from('trades')
          .insert(tradeData);

        if (saveError) {
          console.error('Failed to save trade:', saveError);
          return {
            status: 'failed',
            error: 'Failed to save trade',
            recommendation,
          };
        }

        // Initiate trade execution
        fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/trade`, {
          method: 'POST',
          body: JSON.stringify({
            trade: {
              amount: matchingAgent.balance,
              trade_action: 'SELL',
              name: matchingAgent.name || 'Unknown Agent',
              contract_address: matchingAgent.contract_address,
            },
            tradeId,
          }),
        }).catch((error) => {
          console.error(`Trade execution failed:`, error);
          supabaseService
            .from('trades')
            .update({ status: 'FAILED', error: error.message })
            .match({ trade_id: tradeId });
        });

        return {
          status: 'pending',
          message: 'Trade request accepted',
          trade_id: tradeId,
          recommendation,
        };
      })
    );

    return Response.json({
      recommendations: sellRecommendations,
      execution_results: trades,
      portfolio_matches: matchingTokens,
    });
  } catch (error) {
    console.error('API error:', error);
    return Response.json(
      { error: 'Failed to perform analysis' },
      { status: 500 }
    );
  }
}
