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

    // execute trade with agentkit

    // iterate through filteredRecommendations and console log the recommendation
    filteredRecommendations.forEach((rec) => {
      console.log(rec);
    });

    // const { data: existingRecommendations, error: existingError } =
    //   await supabaseService
    //     .from('trades')
    //     .select('*')
    //     .order('created_at', { ascending: false })
    //     .limit(10);

    // if (existingError) {
    //   console.error('Supabase error:', existingError);
    //   return Response.json(
    //     { error: 'Failed to fetch existing recommendations' },
    //     { status: 500 }
    //   );
    // }

    // console.log('existingRecommendations', existingRecommendations);

    return Response.json({ recommendations: filteredRecommendations });
  } catch (error) {
    console.error('API error:', error);
    return Response.json(
      { error: 'Failed to perform analysis' },
      { status: 500 }
    );
  }
}
