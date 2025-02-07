import { CookieApiResponse, CookieInterval } from '@/types/cookie-api';

export const getSystemPrompt =
  () => `You are an expert cryptocurrency financial analyst specializing in on-chain analytics and social sentiment analysis. Your analysis must be structured in the following format:

EXECUTIVE SUMMARY
• Provide a 2-3 sentence overview of your key findings and recommendation
• Refer to 'the token' as the subject of the analysis

TECHNICAL ANALYSIS (Score: 0-10)
• Price Action: Support/resistance levels, chart patterns, momentum indicators
• Volume Analysis: Liquidity depth, volume trends, unusual activity
• Market Structure: Market efficiency, holder distribution, concentration risks

SOCIAL METRICS (Score: 0-10)
• Sentiment Analysis: Overall community mood, sentiment trend, notable shifts
• Engagement Quality: Smart follower dynamics, engagement patterns
• Social Momentum: Viral coefficient, mindshare growth/decline

TRADING RECOMMENDATION
• Position: [BUY/SELL/HOLD]
• Conviction: [HIGH/MEDIUM/LOW]
• Time Horizon: [SHORT/MEDIUM/LONG] term

SUPPORTING RATIONALE
Provide 2-3 key data points that most strongly support your recommendation`;

export const generateAnalysisPrompt = (
  cookieData: CookieApiResponse,
  searchTexts: string[]
) => {
  const sevenDayData = cookieData._7Days;
  const threeDayData = cookieData._3Days;

  if (!sevenDayData || !threeDayData) {
    throw new Error('Missing required data for analysis');
  }

  return `Analyze the following cryptocurrency data and provide a structured investment recommendation:

Market Metrics (7-Day vs 3-Day Comparison):
${generateMarketMetricsTable(sevenDayData, threeDayData)}

Key Performance Indicators:
• Liquidity Depth: $${sevenDayData.liquidity.toLocaleString()}
• Volume/Market Cap Ratio: ${(
    (sevenDayData.volume24Hours / sevenDayData.marketCap) *
    100
  ).toFixed(2)}%
• 7-Day Volatility: ${Math.abs(sevenDayData.priceDeltaPercent).toFixed(2)}%
• Smart Money Ratio: ${(
    (sevenDayData.smartFollowersCount / sevenDayData.followersCount) *
    100
  ).toFixed(2)}%
• Engagement Quality: ${(
    (sevenDayData.averageEngagementsCount /
      sevenDayData.averageImpressionsCount) *
    100
  ).toFixed(2)}%

Trend Signals (7-Day):
PRICE: ${sevenDayData.priceTrend} | VOLUME: ${
    sevenDayData.volumeTrend
  } | MINDSHARE: ${sevenDayData.mindshareTrend}
MARKET CAP: ${sevenDayData.marketCapTrend} | ENGAGEMENT: ${
    sevenDayData.engagementsTrend
  }
SMART FOLLOWS: ${sevenDayData.smartFollowsTrend}

Recent Social Context:
${searchTexts.map((text, i) => `[${i + 1}] ${text}`).join('\n')}

Using the data above, provide your analysis following the exact format specified in your system prompt. Ensure all recommendations are data-driven and quantified where possible.`;
};

// Helper function to generate the metrics table
const generateMarketMetricsTable = (
  sevenDayData: CookieInterval,
  threeDayData: CookieInterval
) => `
| Metric | 7-Day Value | 7-Day Δ% | 3-Day Value | 3-Day Δ% |
|--------|-------------|----------|-------------|----------|
| Price | $${sevenDayData.price.toFixed(
  2
)} | ${sevenDayData.priceDeltaPercent.toFixed(
  2
)}% | $${threeDayData.price.toFixed(
  2
)} | ${threeDayData.priceDeltaPercent.toFixed(2)}% |
| Market Cap | $${sevenDayData.marketCap.toLocaleString()} | ${sevenDayData.marketCapDeltaPercent.toFixed(
  2
)}% | $${threeDayData.marketCap.toLocaleString()} | ${threeDayData.marketCapDeltaPercent.toFixed(
  2
)}% |
| Volume (24h) | $${sevenDayData.volume24Hours.toLocaleString()} | ${sevenDayData.volume24HoursDeltaPercent.toFixed(
  2
)}% | $${threeDayData.volume24Hours.toLocaleString()} | ${threeDayData.volume24HoursDeltaPercent.toFixed(
  2
)}% |
| Mindshare | ${sevenDayData.mindshare.toFixed(
  2
)}% | ${sevenDayData.mindshareDeltaPercent.toFixed(
  2
)}% | ${threeDayData.mindshare.toFixed(
  2
)}% | ${threeDayData.mindshareDeltaPercent.toFixed(2)}% |`;
