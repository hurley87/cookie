'use server';

import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export async function getAgentInfo(contractAddress?: string) {
  'use server';

  const { supabaseService } = await import('@/lib/services/supabase');

  try {
    let query = supabaseService.from('agents').select('*');

    if (contractAddress) {
      query = query.eq('contract_address', contractAddress);
    }

    query = query.order('updated_at', { ascending: false });

    const { data: agents, error } = await query;

    if (error) {
      console.error('Error fetching agents:', error);
      throw new Error('Failed to fetch agent information');
    }

    // If looking for a specific agent and none found
    if (contractAddress && (!agents || agents.length === 0)) {
      throw new Error('Agent not found');
    }

    // Process and format the data
    const formattedAgents = agents.map((agent: any) => ({
      contract_address: agent.contract_address,
      name: agent.name || 'Unknown Agent',
      twitter: agent.twitter,
      _7Days: agent._7Days || {
        mindshare: 0,
        mindshareDeltaPercent: 0,
        marketCap: 0,
        marketCapDeltaPercent: 0,
        volume24Hours: 0,
      },
      _3Days: agent._3Days || {
        mindshare: 0,
        mindshareDeltaPercent: 0,
        marketCap: 0,
        marketCapDeltaPercent: 0,
        volume24Hours: 0,
      },
      analysis: agent.analysis || {
        sentiment: 'NEUTRAL',
        confidence: 'LOW',
        summary: 'No analysis available',
        key_metrics: [],
      },
    }));

    return {
      success: true,
      agents: formattedAgents,
    };
  } catch (error) {
    console.error('Error in getAgentInfo:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
}

export async function continueConversation(history: Message[]) {
  'use server';

  // Fetch agent data
  const agentData = await getAgentInfo();
  const agents =
    agentData.success && Array.isArray(agentData.agents)
      ? agentData.agents
      : [];

  // Format agent data for the prompt
  const agentSummary = agents
    .map(
      (agent) => `
Agent: ${agent.name} (@${agent.twitter})
Analysis:

Executive Summary:
${agent.analysis.executiveSummary}

Technical Analysis (Score: ${agent.analysis.technicalAnalysis.score}/10):
- Price Action: ${agent.analysis.technicalAnalysis.priceAction}
- Volume Analysis: ${agent.analysis.technicalAnalysis.volumeAnalysis}
- Market Structure: ${agent.analysis.technicalAnalysis.marketStructure}

Social Metrics (Score: ${agent.analysis.socialMetrics.score}/10):
- Sentiment: ${agent.analysis.socialMetrics.sentimentAnalysis}
- Engagement: ${agent.analysis.socialMetrics.engagementQuality}
- Social Momentum: ${agent.analysis.socialMetrics.socialMomentum}

Trading Recommendation:
- Position: ${agent.analysis.tradingRecommendation.position}
- Conviction: ${agent.analysis.tradingRecommendation.conviction}
- Time Horizon: ${agent.analysis.tradingRecommendation.timeHorizon}

Contract: ${agent.contract_address}
`
    )
    .join('\n');

  const { textStream } = await streamText({
    model: openai('gpt-4o-mini'),
    system: `You are an AI trading assistant specializing in AI agent token analysis and recommendations. You have access to real-time data and analysis about AI agents and their performance metrics. Below is the current data about all tracked agents:

${agentSummary}

Your primary role is to provide data-driven trading insights and recommendations based on the stored analysis and metrics for each agent.`,
    messages: history,
    tools: {
      buyorsell: {
        description: 'Buy or Sell a specific agent token',
        parameters: z.object({
          contract_address: z.string(),
          trade_action: z.enum(['BUY', 'SELL']),
          name: z.string(),
          amount: z.string(),
        }),
        execute: async ({ contract_address, trade_action, name, amount }) => {
          const trade = {
            contract_address,
            trade_action,
            name,
            amount,
          };

          try {
            const response = await fetch(
              `${process.env.NEXT_PUBLIC_APP_URL}/api/trade`,
              {
                method: 'POST',
                body: JSON.stringify({ trade }),
              }
            );

            const { agentResponse } = await response.json();
            return `Trade executed: ${agentResponse}`;
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : 'Trade execution failed';
            throw new Error(errorMessage);
          }
        },
      },
    },
  });

  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  const encoder = new TextEncoder();

  (async () => {
    try {
      for await (const chunk of textStream) {
        await writer.write(encoder.encode(chunk));
      }
    } catch (error) {
      console.error('Streaming error:', error);
    } finally {
      await writer.close();
    }
  })();

  return stream.readable;
}
