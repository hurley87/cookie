import { notFound } from 'next/navigation';
import { supabaseService } from '@/lib/services/supabase';
import { AgentAnalysisRecord } from '@/types/agent';
import Link from 'next/link';
import { MetricCard } from '@/components/metric-card';

export const revalidate = 60;

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
    <main className="container mx-auto p-4 max-w-xl">
      <div className="mb-4">
        <Link href="/" className="text-blue-500 hover:underline">
          Back
        </Link>
      </div>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="p-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold">{agent.name}</h1>
              <Link
                href={`https://x.com/${agent.twitter}`}
                target="_blank"
                className="text-blue-500 hover:underline"
              >
                @{agent.twitter}
              </Link>
            </div>
            <Link
              href={`https://dexscreener.com/base/${agent.contract_address}`}
              target="_blank"
              className="text-blue-500 hover:underline"
            >
              View on DEX Screener
            </Link>
          </div>
          <div className="text-sm text-gray-500">
            Last updated: {new Date(agent.updated_at!).toLocaleString()}
          </div>
        </div>

        <div className="h-px bg-gray-200" />

        {/* Trading Recommendation */}
        <div className="p-0">
          <h2 className="text-xl font-semibold mb-4">Trading Recommendation</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">Position</div>
              <div
                className={`text-xl font-bold ${
                  agent.analysis.tradingRecommendation.position === 'BUY'
                    ? 'text-green-500'
                    : agent.analysis.tradingRecommendation.position === 'SELL'
                    ? 'text-red-500'
                    : 'text-yellow-500'
                }`}
              >
                {agent.analysis.tradingRecommendation.position}
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">Conviction</div>
              <div className="text-xl font-bold">
                {agent.analysis.tradingRecommendation.conviction}
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">Time Horizon</div>
              <div className="text-xl font-bold">
                {agent.analysis.tradingRecommendation.timeHorizon}
              </div>
            </div>
          </div>
        </div>

        <div className="h-px bg-gray-200" />

        {/* 3-Day Performance Metrics */}
        {agent._3Days && (
          <>
            <div className="p-0">
              <h2 className="text-xl font-semibold mb-6">
                3-Day Performance Metrics
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

            <div className="p-0">
              <h2 className="text-xl font-semibold mb-4">
                3-Day Social Performance
              </h2>
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
            <div className="h-px bg-gray-200" />
          </>
        )}

        {/* 7-Day Performance Metrics */}
        {agent._7Days && (
          <>
            <div className="p-0">
              <h2 className="text-xl font-semibold mb-6">
                7-Day Performance Metrics
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

            <div className="p-0">
              <h2 className="text-xl font-semibold mb-4">
                7-Day Social Performance
              </h2>
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
            <div className="h-px bg-gray-200" />
          </>
        )}

        {/* Analysis Stats */}
        <div className="p-0">
          <h2 className="text-xl font-semibold mb-6">Detailed Analysis</h2>

          {/* Executive Summary */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3">Executive Summary</h3>
            <p className="text-gray-700">{agent.analysis.executiveSummary}</p>
          </div>

          {/* Technical Analysis */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3">Technical Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Score</div>
                <div className="text-xl font-bold">
                  {agent.analysis.technicalAnalysis.score}/10
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Price Action</div>
                <div className="text-gray-700">
                  {agent.analysis.technicalAnalysis.priceAction}
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">
                  Volume Analysis
                </div>
                <div className="text-gray-700">
                  {agent.analysis.technicalAnalysis.volumeAnalysis}
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">
                  Market Structure
                </div>
                <div className="text-gray-700">
                  {agent.analysis.technicalAnalysis.marketStructure}
                </div>
              </div>
            </div>
          </div>

          {/* Social Metrics */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3">Social Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Score</div>
                <div className="text-xl font-bold">
                  {agent.analysis.socialMetrics.score}/10
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">
                  Sentiment Analysis
                </div>
                <div className="text-gray-700">
                  {agent.analysis.socialMetrics.sentimentAnalysis}
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">
                  Engagement Quality
                </div>
                <div className="text-gray-700">
                  {agent.analysis.socialMetrics.engagementQuality}
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">
                  Social Momentum
                </div>
                <div className="text-gray-700">
                  {agent.analysis.socialMetrics.socialMomentum}
                </div>
              </div>
            </div>
          </div>

          {/* Supporting Rationale */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3">Supporting Rationale</h3>
            <ul className="list-disc list-inside space-y-2">
              {agent.analysis.supportingRationale.map((rationale, index) => (
                <li key={index} className="text-gray-700">
                  {rationale}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="h-px bg-gray-200" />

        {/* Recent Tweet */}
        {agent.tweets && agent.tweets.length > 0 && (
          <div className="p-0">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {agent.tweets.map((tweet, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="mb-2">
                    <a
                      href={`https://x.com/${tweet.authorUsername}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      @{tweet.authorUsername}
                    </a>
                  </div>
                  <p className="text-gray-800">{tweet.text}</p>
                  <div className="mt-2 text-sm text-gray-500 flex gap-4">
                    <span>❤️ {tweet.likesCount}</span>
                    <span>🔄 {tweet.retweetsCount}</span>
                    <span>💬 {tweet.repliesCount}</span>
                    <span>{new Date(tweet.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
