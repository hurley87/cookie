import { Agent } from '@/types/agent';

export const getSystemPrompt =
  () => `You are an expert cryptocurrency portfolio manager specializing in AI agent tokens. Your task is to analyze multiple tokens and provide clear trading recommendations based on their performance metrics, market trends, and social signals.

Key Analysis Points:
1. Market Performance
   - Price trends and volatility
   - Volume and liquidity depth
   - Market cap trajectory

2. Social & Community Metrics
   - Mindshare growth/decline
   - Engagement quality
   - Smart money movements

3. Risk Assessment
   - Liquidity risks
   - Concentration metrics
   - Market structure

Your recommendations should be data-driven and consider both technical and social factors. Never recommend a BUY for more than 20% of available ETH.`;

export const generateTradePrompt = (agents: Agent[]) => {
  const agentMetrics = agents
    .map(
      (agent) => `
Agent: ${agent.name}
Contract: ${agent.contract_address}
Twitter: @${agent.twitter}

3-Day Metrics:
- Price: $${agent._3Days.price.toFixed(
        5
      )} (${agent._3Days.priceDeltaPercent.toFixed(2)}%)
- Market Cap: $${(agent._3Days.marketCap / 1e6).toFixed(
        2
      )}M (${agent._3Days.marketCapDeltaPercent.toFixed(2)}%)
- Volume 24h: $${(agent._3Days.volume24Hours / 1e6).toFixed(
        2
      )}M (${agent._3Days.volume24HoursDeltaPercent.toFixed(2)}%)
- Mindshare: ${agent._3Days.mindshare.toFixed(
        2
      )}% (${agent._3Days.mindshareDeltaPercent.toFixed(2)}%)
- Liquidity: $${(agent._3Days.liquidity / 1e6).toFixed(2)}M
- Holders: ${agent._3Days.holdersCount.toLocaleString()}

Market Signals:
- Price Trend: ${agent._3Days.priceTrend}
- Volume Trend: ${agent._3Days.volumeTrend}
- Mindshare Trend: ${agent._3Days.mindshareTrend}
- Market Cap Trend: ${agent._3Days.marketCapTrend}
`
    )
    .join('\n---\n');

  return `Analyze the following agents and provide trading recommendations for each:

${agentMetrics}

Based on the data above, provide a recommendation for each agent. Consider:
1. Recent performance metrics and trends
2. Market structure and liquidity
3. Social engagement and mindshare growth
4. Risk-adjusted return potential

For each agent, provide a recommendation following this structure:
1. Agent name and contract address
2. Trade action (BUY/SELL/HOLD)
3. Conviction level (HIGH/MEDIUM/LOW)
4. Time horizon (SHORT/MEDIUM/LONG)
5. Allocation percentage (0-100)
   - For BUY recommendations, allocations should sum to 100% across all agents
   - For SELL/HOLD, set allocation to 0
6. Justification with key data points`;
};
