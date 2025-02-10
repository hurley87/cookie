import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { supabaseService } from '@/lib/services/supabase';
import {
  getSystemPrompt,
  generateTradePrompt,
} from '@/lib/prompts/trade-generator';
import { tradeRecommendationSchema } from '@/lib/schemas/trade-recommendation';
import { base } from 'viem/chains';
import { createPublicClient, formatEther, http } from 'viem';

const publicClient = createPublicClient({
  chain: base,
  transport: http('https://base.llamarpc.com'),
});

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

    // Generate trading recommendations
    const { object: recommendations } = await generateObject({
      model: openai('gpt-4o-mini'),
      schema: tradeRecommendationSchema,
      system: getSystemPrompt(),
      prompt: generateTradePrompt(agents),
    });

    // Filter out HOLD recommendations and non-HIGH conviction trades
    const filteredRecommendations = recommendations.recommendations.filter(
      (rec) =>
        rec.trade.trade_action !== 'HOLD' &&
        rec.trade.conviction_level === 'HIGH'
    );

    // wallet is 0x9ce10cd2916b74BF078D935b005dcf6E6147b598
    // get balance of wallet
    const balance = await publicClient.getBalance({
      address: '0x9ce10cd2916b74BF078D935b005dcf6E6147b598',
    });
    console.log('balance', balance);
    const formattedBalance = formatEther(balance);
    console.log('formattedBalance', formattedBalance);

    // Calculate maximum tradeable amount (10% of wallet balance)
    const maxTradeableAmount = parseFloat(formattedBalance) * 0.1;
    console.log('maxTradeableAmount', maxTradeableAmount);

    // If no valid recommendations after filtering, return empty response
    if (filteredRecommendations.length === 0) {
      return Response.json({ recommendations: { recommendations: [] } });
    }

    // Calculate ETH amounts for BUY trades to ensure they don't exceed 10% of wallet balance
    const buyRecommendations = filteredRecommendations.filter(
      (rec) => rec.trade.trade_action === 'BUY'
    );

    if (buyRecommendations.length > 0) {
      const totalAllocation = buyRecommendations.reduce(
        (sum, rec) => sum + (rec.trade.eth_amount || 0),
        0
      );

      // If total ETH amount exceeds maxTradeableAmount, scale down proportionally
      if (totalAllocation > maxTradeableAmount) {
        const scaleFactor = maxTradeableAmount / totalAllocation;
        buyRecommendations.forEach((rec) => {
          rec.trade.eth_amount = parseFloat(
            (rec.trade.eth_amount * scaleFactor).toFixed(6)
          );
        });
      }
    }

    // Execute trades by making POST requests to the trade-execute endpoint
    const results = await Promise.all(
      filteredRecommendations.map(async (recommendation) => {
        console.log('recommendation', recommendation);

        const trade = {
          ...recommendation.trade,
          justification: recommendation.justification,
        };

        console.log('trade', trade);

        try {
          const { data, error } = await supabaseService
            .from('trades')
            .insert(trade);

          if (error) {
            console.error('Supabase error:', error);
            return Response.json(
              { error: 'Failed to save recommendation' },
              { status: 500 }
            );
          }

          console.log('recommendation saved successfully', data);

          return {
            status: 'success',
            message: 'Recommendation saved successfully',
          };
        } catch (error) {
          console.error(
            `Trade execution failed for ${recommendation.trade.name}:`,
            error
          );
          return {
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      })
    );

    return Response.json({
      recommendations: filteredRecommendations,
      execution_results: results,
    });
  } catch (error) {
    console.error('API error:', error);
    return Response.json(
      { error: 'Failed to perform analysis' },
      { status: 500 }
    );
  }
}
