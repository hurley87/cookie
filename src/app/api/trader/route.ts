import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { supabaseService } from '@/lib/services/supabase';
import {
  getSystemPrompt,
  generateTradePrompt,
} from '@/lib/prompts/trade-generator';
import { tradeRecommendationSchema } from '@/lib/schemas/trade-recommendation';

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

    // If no valid recommendations after filtering, return empty response
    if (filteredRecommendations.length === 0) {
      return Response.json({ recommendations: { recommendations: [] } });
    }

    // Recalculate allocations for BUY trades to ensure they sum to 100%
    const buyRecommendations = filteredRecommendations.filter(
      (rec) => rec.trade.trade_action === 'BUY'
    );

    if (buyRecommendations.length > 0) {
      const totalAllocation = buyRecommendations.reduce(
        (sum, rec) => sum + rec.trade.allocation_percentage,
        0
      );

      // Normalize allocations to sum to 100%
      buyRecommendations.forEach((rec) => {
        rec.trade.allocation_percentage =
          (rec.trade.allocation_percentage / totalAllocation) * 100;
      });
    }

    // Execute trades by making POST requests to the trade-execute endpoint
    const results = await Promise.all(
      filteredRecommendations.map(async (recommendation) => {
        console.log('recommendation', recommendation);
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_APP_URL}/api/trade-execute`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ recommendation }),
            }
          );

          if (!response.ok) {
            throw new Error(`Trade execution failed: ${response.statusText}`);
          }

          return await response.json();
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
