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

export const maxDuration = 300;

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

    // Filter out HOLD and SELL recommendations and non-HIGH conviction trades
    const buyRecommendations = recommendations.recommendations.filter(
      (rec) =>
        rec.trade.trade_action === 'BUY' &&
        rec.trade.conviction_level === 'HIGH'
    );

    // If no valid recommendations after filtering, return empty response
    if (buyRecommendations.length === 0) {
      return Response.json({ recommendations: { recommendations: [] } });
    }

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

    // Calculate ETH amounts for BUY trades
    buyRecommendations.forEach((rec) => {
      // Calculate ETH amount as allocation_percentage / 100 * maxTradeableAmount
      const ethAmount =
        (rec.trade.allocation_percentage / 100) * maxTradeableAmount;
      // Store the ETH amount with 6 decimal places precision
      rec.trade.eth_amount = parseFloat(ethAmount.toFixed(6)).toString();
    });

    // Execute trades by making POST requests to the trade-execute endpoint
    const results = await Promise.all(
      buyRecommendations.map(async (recommendation) => {
        console.log('recommendation', recommendation);

        const { allocation_percentage, ...tradeWithoutAllocation } =
          recommendation.trade;

        console.log('allocation_percentage', allocation_percentage);

        const savedTrade = {
          ...tradeWithoutAllocation,
          justification: recommendation.justification,
        };

        console.log('savedTrade', savedTrade);

        const trade = {
          amount: savedTrade.eth_amount,
          trade_action: savedTrade.trade_action,
          name: savedTrade.name,
          contract_address: savedTrade.token_contract,
        };

        console.log('trade', trade);

        try {
          // Generate a unique trade ID
          const tradeId = crypto.randomUUID();

          // Prepare the trade data
          const tradeData = {
            ...tradeWithoutAllocation,
            justification: recommendation.justification,
            status: 'PENDING' as const,
            trade_id: tradeId,
            created_at: new Date().toISOString(),
          };

          // Save the trade request immediately
          const { error: saveError } = await supabaseService
            .from('trades')
            .insert(tradeData);

          if (saveError) {
            console.error('Supabase error:', saveError);
            return {
              status: 'failed',
              error: 'Failed to save trade request',
            };
          }

          // Initiate the trade execution asynchronously
          fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/trade`, {
            method: 'POST',
            body: JSON.stringify({ trade, tradeId }),
          }).catch((error) => {
            console.error(
              `Background trade execution failed for ${recommendation.trade.name}:`,
              error
            );
            // Update trade status to failed in case of error
            supabaseService
              .from('trades')
              .update({ status: 'FAILED', error: error.message })
              .match({ trade_id: tradeId })
              .then(() => {
                console.log('Trade status updated to FAILED');
              });
          });

          // Return immediate success response with trade ID
          return {
            status: 'pending',
            message: 'Trade request accepted',
            trade_id: tradeId,
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
      recommendations: buyRecommendations,
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
