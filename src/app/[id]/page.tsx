import { notFound } from 'next/navigation';
import { supabaseService } from '@/lib/services/supabase';
import { AgentAnalysisRecord } from '@/types/agent';
import Link from 'next/link';
import { MetricCard } from '@/components/metric-card';

export const revalidate = 60;

const positionColor = {
  BUY: 'bg-green-100 text-green-700 border-green-200',
  SELL: 'bg-red-100 text-red-700 border-red-200',
  HOLD: 'bg-yellow-100 text-yellow-700 border-yellow-200',
};

const positionEmoji = {
  BUY: '🚀',
  SELL: '🔻',
  HOLD: '⏳',
};

async function getAgent(id: string): Promise<AgentAnalysisRecord | null> {
  const { data, error } = await supabaseService
    .from('agents')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching agent:', error);
    return null;
  }

  return data;
}

type Params = Promise<{ id: string }>;

export default async function AgentPage({ params }: { params: Params }) {
  const { id } = await params;
  const agent = await getAgent(id);

  if (!agent) {
    notFound();
  }

  return (
    <main className="container mx-auto py-6 px-4 max-w-3xl">
      <div className="mb-6">
        <Link
          href="/"
          className="text-white hover:scale-105 transform transition-all duration-200 inline-flex items-center gap-2"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Feed
        </Link>
      </div>

      <div className="space-y-6">
        {/* Header Section */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="px-6 pt-6 pb-4 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between mb-4">
              <div className="space-y-1">
                <h1 className="text-2xl font-bold text-gray-900">
                  {agent.name}
                </h1>
                <Link
                  href={`https://x.com/${agent.twitter}`}
                  target="_blank"
                  className="text-blue-500 hover:text-blue-600 hover:scale-105 transform transition-all duration-200 inline-flex items-center gap-1"
                >
                  <span>@{agent.twitter}</span>
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M10 6v2H5v11h11v-5h2v6a1 1 0 01-1 1H4a1 1 0 01-1-1V7a1 1 0 011-1h6zm11-3v8h-2V6.413l-7.293 7.294-1.414-1.414L17.586 5H13V3h8z" />
                  </svg>
                </Link>
              </div>
              <Link
                href={`https://dexscreener.com/base/${agent.contract_address}`}
                target="_blank"
                className="text-blue-500 hover:text-blue-600 hover:scale-105 transform transition-all duration-200 inline-flex items-center gap-1"
              >
                <span>View on DEX Screener</span>
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M10 6v2H5v11h11v-5h2v6a1 1 0 01-1 1H4a1 1 0 01-1-1V7a1 1 0 011-1h6zm11-3v8h-2V6.413l-7.293 7.294-1.414-1.414L17.586 5H13V3h8z" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Trading Recommendation */}
          <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-t border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Trading Recommendation
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col">
                <span className="text-sm text-gray-500 mb-1">Position</span>
                <span
                  className={`font-semibold text-lg px-3 py-1 rounded-lg border ${
                    positionColor[
                      agent.analysis.tradingRecommendation
                        .position as keyof typeof positionColor
                    ]
                  } inline-flex items-center gap-2`}
                >
                  <span>
                    {
                      positionEmoji[
                        agent.analysis.tradingRecommendation
                          .position as keyof typeof positionEmoji
                      ]
                    }
                  </span>
                  {agent.analysis.tradingRecommendation.position}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-500 mb-1">Conviction</span>
                <span className="font-medium text-gray-900 bg-white px-3 py-1 rounded-lg border border-gray-200">
                  {agent.analysis.tradingRecommendation.conviction}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-500 mb-1">Time Horizon</span>
                <span className="font-medium text-gray-900 bg-white px-3 py-1 rounded-lg border border-gray-200">
                  {agent.analysis.tradingRecommendation.timeHorizon}
                </span>
              </div>
            </div>
          </div>

          {/* Last Updated */}
          <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-t border-gray-200">
            <span className="text-sm text-gray-500">
              Updated {new Date(agent.updated_at!).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Analysis Section */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Detailed Analysis
            </h2>

            {/* Executive Summary */}
            <div className="mb-8">
              <h3 className="text-base font-medium text-gray-900 mb-3">
                Executive Summary
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {agent.analysis.executiveSummary}
              </p>
            </div>

            {/* Technical Analysis */}
            <div className="mb-8">
              <h3 className="text-base font-medium text-gray-900 mb-3">
                Technical Analysis
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Score:</span>
                  <span className="font-medium">
                    {agent.analysis.technicalAnalysis.score}/10
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Price Action</p>
                  <p className="text-gray-700 leading-relaxed">
                    {agent.analysis.technicalAnalysis.priceAction}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Volume Analysis</p>
                  <p className="text-gray-700 leading-relaxed">
                    {agent.analysis.technicalAnalysis.volumeAnalysis}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Market Structure</p>
                  <p className="text-gray-700 leading-relaxed">
                    {agent.analysis.technicalAnalysis.marketStructure}
                  </p>
                </div>
              </div>
            </div>

            {/* Social Metrics */}
            <div className="mb-8">
              <h3 className="text-base font-medium text-gray-900 mb-3">
                Social Metrics
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Score:</span>
                  <span className="font-medium">
                    {agent.analysis.socialMetrics.score}/10
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">
                    Sentiment Analysis
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    {agent.analysis.socialMetrics.sentimentAnalysis}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">
                    Engagement Quality
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    {agent.analysis.socialMetrics.engagementQuality}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Social Momentum</p>
                  <p className="text-gray-700 leading-relaxed">
                    {agent.analysis.socialMetrics.socialMomentum}
                  </p>
                </div>
              </div>
            </div>

            {/* Supporting Rationale */}
            <div>
              <h3 className="text-base font-medium text-gray-900 mb-3">
                Supporting Rationale
              </h3>
              <ul className="list-disc list-inside space-y-2">
                {agent.analysis.supportingRationale.map((rationale, index) => (
                  <li key={index} className="text-gray-700 leading-relaxed">
                    {rationale}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* 3-Day Performance Metrics */}
        {agent._3Days && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                3-Day Performance
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MetricCard
                  label="Price"
                  value={`$${agent._3Days.price.toFixed(5)}`}
                  change={agent._3Days.priceDeltaPercent}
                />
                <MetricCard
                  label="Mindshare"
                  value={`${agent._3Days.mindshare.toFixed(4)}%`}
                  change={agent._3Days.mindshareDeltaPercent}
                />
                <MetricCard
                  label="Market Cap"
                  value={`$${(agent._3Days.marketCap / 1e6).toFixed(2)}M`}
                  change={agent._3Days.marketCapDeltaPercent}
                />
                <MetricCard
                  label="Volume (24h)"
                  value={`$${(agent._3Days.volume24Hours / 1e6).toFixed(2)}M`}
                  change={agent._3Days.volume24HoursDeltaPercent}
                />
                <MetricCard
                  label="Holders"
                  value={agent._3Days.holdersCount.toString()}
                  change={agent._3Days.holdersCountDeltaPercent}
                />
                <MetricCard
                  label="Liquidity"
                  value={`$${(agent._3Days.liquidity / 1e6).toFixed(2)}M`}
                  change={0}
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Social Performance
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MetricCard
                  label="Avg. Impressions"
                  value={agent._3Days.averageImpressionsCount.toLocaleString()}
                  change={agent._3Days.averageImpressionsCountDeltaPercent}
                />
                <MetricCard
                  label="Avg. Engagements"
                  value={agent._3Days.averageEngagementsCount.toLocaleString()}
                  change={agent._3Days.averageEngagementsCountDeltaPercent}
                />
                <MetricCard
                  label="Smart Followers"
                  value={agent._3Days.smartFollowersCount.toLocaleString()}
                  change={0}
                />
              </div>
            </div>
          </div>
        )}

        {/* 7-Day Performance Metrics */}
        {agent._7Days && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                7-Day Performance
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MetricCard
                  label="Price"
                  value={`$${agent._7Days.price.toFixed(5)}`}
                  change={agent._7Days.priceDeltaPercent}
                />
                <MetricCard
                  label="Mindshare"
                  value={`${agent._7Days.mindshare.toFixed(4)}%`}
                  change={agent._7Days.mindshareDeltaPercent}
                />
                <MetricCard
                  label="Market Cap"
                  value={`$${(agent._7Days.marketCap / 1e6).toFixed(2)}M`}
                  change={agent._7Days.marketCapDeltaPercent}
                />
                <MetricCard
                  label="Volume (24h)"
                  value={`$${(agent._7Days.volume24Hours / 1e6).toFixed(2)}M`}
                  change={agent._7Days.volume24HoursDeltaPercent}
                />
                <MetricCard
                  label="Holders"
                  value={agent._7Days.holdersCount.toString()}
                  change={agent._7Days.holdersCountDeltaPercent}
                />
                <MetricCard
                  label="Liquidity"
                  value={`$${(agent._7Days.liquidity / 1e6).toFixed(2)}M`}
                  change={0}
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Social Performance
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MetricCard
                  label="Avg. Impressions"
                  value={agent._7Days.averageImpressionsCount.toLocaleString()}
                  change={agent._7Days.averageImpressionsCountDeltaPercent}
                />
                <MetricCard
                  label="Avg. Engagements"
                  value={agent._7Days.averageEngagementsCount.toLocaleString()}
                  change={agent._7Days.averageEngagementsCountDeltaPercent}
                />
                <MetricCard
                  label="Smart Followers"
                  value={agent._7Days.smartFollowersCount.toLocaleString()}
                  change={0}
                />
              </div>
            </div>
          </div>
        )}

        {/* Recent Tweets */}
        {agent.tweets && agent.tweets.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                Recent Activity
                <svg
                  className="w-5 h-5 text-blue-400"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z" />
                </svg>
              </h2>
              <div className="space-y-4">
                {agent.tweets.map((tweet, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Link
                        href={`https://x.com/${tweet.authorUsername}`}
                        target="_blank"
                        className="text-blue-500 hover:text-blue-600 hover:scale-105 transform transition-all duration-200 inline-flex items-center gap-1 font-medium"
                      >
                        <span>@{tweet.authorUsername}</span>
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M10 6v2H5v11h11v-5h2v6a1 1 0 01-1 1H4a1 1 0 01-1-1V7a1 1 0 011-1h6zm11-3v8h-2V6.413l-7.293 7.294-1.414-1.414L17.586 5H13V3h8z" />
                        </svg>
                      </Link>
                      <span className="text-sm text-gray-500">
                        {new Date(tweet.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-700 leading-relaxed mb-3">
                      {tweet.text}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="inline-flex items-center gap-1 hover:text-red-500 transition-colors duration-200">
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                        {tweet.likesCount.toLocaleString()}
                      </span>
                      <span className="inline-flex items-center gap-1 hover:text-green-500 transition-colors duration-200">
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M23.77 15.67c-.292-.293-.767-.293-1.06 0l-2.22 2.22V7.65c0-2.068-1.683-3.75-3.75-3.75h-5.85c-.414 0-.75.336-.75.75s.336.75.75.75h5.85c1.24 0 2.25 1.01 2.25 2.25v10.24l-2.22-2.22c-.293-.293-.768-.293-1.06 0s-.294.768 0 1.06l3.5 3.5c.145.147.337.22.53.22s.383-.072.53-.22l3.5-3.5c.294-.292.294-.767 0-1.06zm-10.66 3.28H7.26c-1.24 0-2.25-1.01-2.25-2.25V6.46l2.22 2.22c.148.147.34.22.532.22s.384-.073.53-.22c.293-.293.293-.768 0-1.06l-3.5-3.5c-.293-.294-.768-.294-1.06 0l-3.5 3.5c-.294.292-.294.767 0 1.06s.767.293 1.06 0l2.22-2.22V16.7c0 2.068 1.683 3.75 3.75 3.75h5.85c.414 0 .75-.336.75-.75s-.337-.75-.75-.75z" />
                        </svg>
                        {tweet.retweetsCount.toLocaleString()}
                      </span>
                      <span className="inline-flex items-center gap-1 hover:text-blue-500 transition-colors duration-200">
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M14.046 2.242l-4.148-.01h-.002c-4.374 0-7.8 3.427-7.8 7.802 0 4.098 3.186 7.206 7.465 7.37v3.828c0 .108.044.286.12.403.142.225.384.347.632.347.138 0 .277-.038.402-.118.264-.168 6.473-4.14 8.088-5.506 1.902-1.61 3.04-3.97 3.043-6.312v-.017c-.006-4.367-3.43-7.787-7.8-7.788zm3.787 12.972c-1.134.96-4.862 3.405-6.772 4.643V16.67c0-.414-.335-.75-.75-.75h-.396c-3.66 0-6.318-2.476-6.318-5.886 0-3.534 2.768-6.302 6.3-6.302l4.147.01h.002c3.532 0 6.3 2.766 6.302 6.296-.003 1.91-.942 3.844-2.514 5.176z" />
                        </svg>
                        {tweet.repliesCount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
