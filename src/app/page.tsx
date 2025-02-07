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
    BUY: 'text-green-500',
    SELL: 'text-red-500',
    HOLD: 'text-yellow-500',
  };

  if (!agents) {
    return <div>No agents found</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-xl">
      {agents.length > 0 && (
        <div className="space-y-4">
          {agents.map((agent: Agent, index: number) => (
            <div key={index} className="mb-8 border-b border-gray-300 pb-4">
              <div className="flex items-center mb-2">
                <div>
                  <h3 className="font-bold text-xl">{agent.name}</h3>
                  <Link target="_blank" href={`https://x.com/${agent.twitter}`}>
                    <p className="text-blue-500 hover:underline">
                      @{agent.twitter}
                    </p>
                  </Link>
                </div>
              </div>
              <div className="flex items-center space-x-4 mb-2">
                <span
                  className={`font-bold ${
                    positionColor[
                      agent.analysis.tradingRecommendation
                        .position as keyof typeof positionColor
                    ]
                  }`}
                >
                  {agent.analysis.tradingRecommendation.position}
                </span>
                <span>
                  Conviction: {agent.analysis.tradingRecommendation.conviction}
                </span>
                <span>
                  Horizon: {agent.analysis.tradingRecommendation.timeHorizon}
                </span>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>
                  ${agent._3Days.price.toFixed(5)} (
                  <span
                    className={`${
                      agent._3Days.priceDeltaPercent >= 0
                        ? 'text-green-500'
                        : 'text-red-500'
                    }`}
                  >
                    ${agent._3Days.priceDeltaPercent.toFixed(2)}%
                  </span>
                  )
                </span>
                <span>
                  {agent._3Days.mindshare.toFixed(4)}% mindshare (
                  <span
                    className={`${
                      agent._3Days.mindshareDeltaPercent >= 0
                        ? 'text-green-500'
                        : 'text-red-500'
                    }`}
                  >
                    {agent._3Days.mindshareDeltaPercent.toFixed(2)}%
                  </span>
                  )
                </span>
                <span>
                  ${(agent._3Days.marketCap / 1e6).toFixed(2)}M mcap (
                  <span
                    className={`${
                      agent._3Days.marketCapDeltaPercent >= 0
                        ? 'text-green-500'
                        : 'text-red-500'
                    }`}
                  >
                    {agent._3Days.marketCapDeltaPercent.toFixed(2)}%
                  </span>
                  )
                </span>
              </div>
              <div className="text-sm text-gray-500 mt-2 flex justify-between items-center">
                <span>{new Date(agent.updated_at).toLocaleString()}</span>
                <div className="flex items-center space-x-2">
                  <a
                    href={`https://dexscreener.com/base/${agent.contract_address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    DEX Screener
                  </a>
                  <span className="text-gray-400">|</span>
                  <Link
                    href={`/${agent.id}`}
                    className="text-blue-500 hover:underline"
                  >
                    Analysis
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
