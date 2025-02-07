import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { supabaseService } from '@/lib/services/supabase';
import { z } from 'zod';

const tweetSchema = z.object({
  tweet: z
    .string()
    .describe('A compelling tweet about the latest agents and trades'),
});

type TweetResponse = z.infer<typeof tweetSchema>;

export async function GET() {
  try {
    // Fetch 5 latest agents
    const { data: agents, error: agentsError } = await supabaseService
      .from('agents')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(5);

    if (agentsError) {
      console.error('Error fetching agents:', agentsError);
      return Response.json(
        { error: 'Failed to fetch agents' },
        { status: 500 }
      );
    }

    // Fetch 5 latest trades
    const { data: trades, error: tradesError } = await supabaseService
      .from('trades')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (tradesError) {
      console.error('Error fetching trades:', tradesError);
      return Response.json(
        { error: 'Failed to fetch trades' },
        { status: 500 }
      );
    }

    // Generate tweet using OpenAI
    const { object: tweetContent } = await generateObject<TweetResponse>({
      model: openai('gpt-4o-mini'),
      schema: tweetSchema,
      system: `You are a crypto market analyst creating compelling tweets about AI agents and their trading activities. 
      Your tweets should be engaging, informative, and highlight key metrics and trends.
      Focus on significant price movements, trading volumes, and market sentiment.
      Use emojis appropriately to enhance readability.
      Keep the tweet within Twitter's character limit.
      Use cashtags ($) for token names when applicable.`,
      prompt: `Create a compelling tweet about the latest AI agents and trades based on this data:

Agents:
${agents
  .map(
    (agent) => `
- ${agent.name}
  • Mindshare: ${agent._3Days.mindshare.toFixed(2)}% (${
      agent._3Days.mindshareDeltaPercent > 0 ? '+' : ''
    }${agent._3Days.mindshareDeltaPercent.toFixed(2)}%)
  • Market Cap: $${(agent._3Days.marketCap / 1e6).toFixed(2)}M (${
      agent._3Days.marketCapDeltaPercent > 0 ? '+' : ''
    }${agent._3Days.marketCapDeltaPercent.toFixed(2)}%)
  • Volume 24h: $${(agent._3Days.volume24Hours / 1e6).toFixed(2)}M
`
  )
  .join('')}

Recent Trades:
${trades
  .map(
    (trade) => `
- ${trade.name}: ${trade.trade_action} with ${trade.conviction_level} conviction
  • Allocation: ${trade.allocation_percentage}%
  • Time Horizon: ${trade.time_horizon}
`
  )
  .join('')}`,
    });

    // Save the tweet to the database
    const { error: saveError } = await supabaseService.from('tweets').insert({
      content: tweetContent.tweet,
      created_at: new Date().toISOString(),
    });

    if (saveError) {
      console.error('Error saving tweet:', saveError);
      return Response.json({ error: 'Failed to save tweet' }, { status: 500 });
    }

    return Response.json({ tweet: tweetContent.tweet });
  } catch (error) {
    console.error('API error:', error);
    return Response.json(
      { error: 'Failed to generate tweet' },
      { status: 500 }
    );
  }
}
