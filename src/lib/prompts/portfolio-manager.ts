import { Agent } from '@/types/agent';

interface PortfolioToken extends Agent {
  balance: string;
  balanceUSD: string;
  symbol: string;
}

export const getSystemPrompt =
  () => `You are an expert cryptocurrency portfolio risk manager specializing in AI agent tokens. Your primary focus is capital preservation and risk management. Your task is to analyze the current portfolio holdings and market conditions to provide precise SELL recommendations when necessary.

Key Risk Management Principles:

1. Portfolio Concentration 📊
   • No single position should exceed 20% of total portfolio value
   • Monitor correlation between AI token positions
   • Assess sector-wide risks affecting multiple holdings

2. Position-Specific Risk Metrics 📈
   • Volatility relative to sector average
   • Liquidity depth vs position size
   • Price momentum and trend stability
   • Smart money flows and institutional interest

3. Exit Triggers 🚨
   • Deteriorating fundamentals
   • Technical breakdown patterns
   • Negative social sentiment shift
   • Liquidity crisis indicators
   • Regulatory concerns
   • Competitive threats

4. Position Sizing Rules 💰
   • Scale out of positions showing weakness
   • Maintain cash reserves for opportunities
   • Consider market correlation in sizing
   • Account for slippage in large positions

Risk Assessment Framework:

LOW RISK (Hold):
   • Strong fundamentals
   • Positive technical trends
   • High liquidity
   • Growing mindshare
   • Institutional interest

MEDIUM RISK (Consider Partial Exit):
   • Mixed signals
   • Increased volatility
   • Declining volume
   • Sentiment shifts
   • Position size concerns

HIGH RISK (Strong Sell):
   • Technical breakdown
   • Fundamental deterioration
   • Liquidity concerns
   • Major sentiment shift
   • Regulatory threats
   • Competitive displacement

Your recommendations must be data-driven and consider both individual position metrics and overall portfolio health.`;

export const generatePortfolioAnalysisPrompt = (tokens: PortfolioToken[]) => {
  const totalPortfolioValue = tokens.reduce(
    (sum, token) => sum + parseFloat(token.balanceUSD),
    0
  );

  const portfolioMetrics = tokens
    .map((token) => {
      const positionPercentage =
        (parseFloat(token.balanceUSD) / totalPortfolioValue) * 100;

      return `
Token: ${token.name} (${token.symbol})
Contract: ${token.contract_address}
Position Size: $${parseFloat(
        token.balanceUSD
      ).toLocaleString()} (${positionPercentage.toFixed(2)}% of portfolio)
Current Balance: ${token.balance} tokens

3-Day Performance:
- Price: $${token._3Days.price.toFixed(
        5
      )} (${token._3Days.priceDeltaPercent.toFixed(2)}%)
- Market Cap: $${(token._3Days.marketCap / 1e6).toFixed(
        2
      )}M (${token._3Days.marketCapDeltaPercent.toFixed(2)}%)
- Volume 24h: $${(token._3Days.volume24Hours / 1e6).toFixed(
        2
      )}M (${token._3Days.volume24HoursDeltaPercent.toFixed(2)}%)
- Mindshare: ${token._3Days.mindshare.toFixed(
        2
      )}% (${token._3Days.mindshareDeltaPercent.toFixed(2)}%)
- Liquidity: $${(token._3Days.liquidity / 1e6).toFixed(2)}M
- Holders: ${token._3Days.holdersCount.toLocaleString()}

Risk Metrics:
- Position vs Liquidity: ${(
        (parseFloat(token.balanceUSD) / token._3Days.liquidity) *
        100
      ).toFixed(2)}%
- Volatility Score: ${Math.abs(token._3Days.priceDeltaPercent).toFixed(2)}

Market Signals:
- Price Trend: ${token._3Days.priceTrend}
- Volume Trend: ${token._3Days.volumeTrend}
- Mindshare Trend: ${token._3Days.mindshareTrend}
- Market Cap Trend: ${token._3Days.marketCapTrend}
`;
    })
    .join('\n---\n');

  return `Analyze the following portfolio positions with a focus on risk management and potential exit opportunities:

Total Portfolio Value: $${totalPortfolioValue.toLocaleString()}

${portfolioMetrics}

For each position that requires action, provide a recommendation following this structure:
1. Token name and contract address
2. Risk Level (HIGH/MEDIUM/LOW)
3. Trade Action (Must be SELL if risk warrants it)
4. Exit Size (% of position to sell: 25%, 50%, 75%, or 100%)
5. Urgency (IMMEDIATE/NEXT 24H/MONITOR)
6. Key Risk Factors (list top 3)
7. Detailed justification with specific metrics

Consider:
1. Individual position risks and portfolio concentration
2. Market liquidity vs position size
3. Technical and social momentum shifts
4. Correlation with other AI token holdings
5. Risk-adjusted return metrics

Only recommend SELL actions for positions that show:
- Clear technical breakdown
- Fundamental deterioration
- Excessive concentration
- Significant risk factors
- Poor risk/reward profile

For all other positions, maintain current holdings and continue monitoring.`;
};
