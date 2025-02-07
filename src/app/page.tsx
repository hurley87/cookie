import Link from 'next/link';
import { Agent } from '@/types/agent';

async function fetchAnalystFeed() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/analyst`
    );
    if (!response.ok) throw new Error('Failed to fetch agents');

    const data = await response.json();

    return data;
  } catch (err) {
    console.error('Error fetching agents:', err);
  }
}

export default async function Home() {
  const agents = await fetchAnalystFeed();

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

  if (!agents) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-gray-500">
        No agents found
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-2xl">
      {agents.length > 0 && (
        <div className="space-y-6">
          {agents.map((agent: Agent, index: number) => (
            <div
              key={index}
              className="group bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200"
            >
              {/* Agent Header */}
              <div className="px-6 pt-6 pb-4 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-xl text-gray-900 flex items-center gap-2">
                    {agent.name}
                  </h3>
                  <Link
                    target="_blank"
                    href={`https://x.com/${agent.twitter}`}
                    className="text-blue-500 hover:text-blue-600 hover:scale-105 transform transition-all duration-200 flex items-center space-x-1"
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
              </div>

              {/* Trading Recommendation */}
              <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-y border-gray-200">
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
                    <span className="text-sm text-gray-500 mb-1">
                      Conviction
                    </span>
                    <span className="font-medium text-gray-900 bg-white px-3 py-1 rounded-lg border border-gray-200">
                      {agent.analysis.tradingRecommendation.conviction}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500 mb-1">
                      Time Horizon
                    </span>
                    <span className="font-medium text-gray-900 bg-white px-3 py-1 rounded-lg border border-gray-200">
                      {agent.analysis.tradingRecommendation.timeHorizon}
                    </span>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="px-6 py-4">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  Last 3 Days
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="group/card bg-gradient-to-br from-gray-50 to-white rounded-lg p-3 border border-gray-200 hover:border-gray-300 transition-all duration-200">
                    <p className="text-sm text-gray-500 mb-1">Price</p>
                    <div className="flex items-baseline space-x-1">
                      <span className="text-base font-medium text-gray-900">
                        ${agent._3Days.price.toFixed(5)}
                      </span>
                      <span
                        className={`text-sm font-medium px-1.5 py-0.5 rounded-full ${
                          agent._3Days.priceDeltaPercent >= 0
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {agent._3Days.priceDeltaPercent >= 0 ? '↑' : '↓'}
                        {Math.abs(agent._3Days.priceDeltaPercent).toFixed(2)}%
                      </span>
                    </div>
                  </div>

                  <div className="group/card bg-gradient-to-br from-gray-50 to-white rounded-lg p-3 border border-gray-200 hover:border-gray-300 transition-all duration-200">
                    <p className="text-sm text-gray-500 mb-1">Mindshare</p>
                    <div className="flex items-baseline space-x-1">
                      <span className="text-base font-medium text-gray-900">
                        {agent._3Days.mindshare.toFixed(4)}%
                      </span>
                      <span
                        className={`text-sm font-medium px-1.5 py-0.5 rounded-full ${
                          agent._3Days.mindshareDeltaPercent >= 0
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {agent._3Days.mindshareDeltaPercent >= 0 ? '↑' : '↓'}
                        {Math.abs(agent._3Days.mindshareDeltaPercent).toFixed(
                          2
                        )}
                        %
                      </span>
                    </div>
                  </div>

                  <div className="group/card bg-gradient-to-br from-gray-50 to-white rounded-lg p-3 border border-gray-200 hover:border-gray-300 transition-all duration-200">
                    <p className="text-sm text-gray-500 mb-1">Market Cap</p>
                    <div className="flex items-baseline space-x-1">
                      <span className="text-base font-medium text-gray-900">
                        ${(agent._3Days.marketCap / 1e6).toFixed(2)}M
                      </span>
                      <span
                        className={`text-sm font-medium px-1.5 py-0.5 rounded-full ${
                          agent._3Days.marketCapDeltaPercent >= 0
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {agent._3Days.marketCapDeltaPercent >= 0 ? '↑' : '↓'}
                        {Math.abs(agent._3Days.marketCapDeltaPercent).toFixed(
                          2
                        )}
                        %
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-t border-gray-200 flex justify-between items-center text-sm">
                <span className="text-gray-500">
                  Updated {new Date(agent.updated_at).toLocaleString()}
                </span>
                <div className="flex items-center space-x-4">
                  <a
                    href={`https://dexscreener.com/base/${agent.contract_address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-gray-700 transition-colors duration-200 flex items-center space-x-1"
                  >
                    <span>DEX Screener</span>
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M10 6v2H5v11h11v-5h2v6a1 1 0 01-1 1H4a1 1 0 01-1-1V7a1 1 0 011-1h6zm11-3v8h-2V6.413l-7.293 7.294-1.414-1.414L17.586 5H13V3h8z" />
                    </svg>
                  </a>
                  <Link
                    href={`/${agent.id}`}
                    className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium text-sm hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
                  >
                    <span>View Analysis</span>
                    <svg
                      className="ml-2 w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
