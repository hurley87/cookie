'use client';

import { AgentAnalysisRecord } from '@/types/agent';
import Link from 'next/link';
import { useState } from 'react';

interface AgentAnalysisViewProps {
  agent: AgentAnalysisRecord;
}

export default function AgentAnalysisView({ agent }: AgentAnalysisViewProps) {
  const [activeTab, setActiveTab] = useState<'3d' | '7d'>('3d');
  const metrics = activeTab === '3d' ? agent._3Days : agent._7Days;

  if (!agent._3Days && !agent._7Days) {
    return (
      <div className="text-center py-8 text-gray-500">
        No metrics data available for this agent
      </div>
    );
  }

  return (
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

      {/* Performance Metrics */}
      <div className="p-0">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Performance Metrics</h2>
          <div className="flex rounded-lg bg-gray-100 p-1">
            <button
              onClick={() => setActiveTab('3d')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === '3d'
                  ? 'bg-white shadow text-gray-900'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              3 Days
            </button>
            <button
              onClick={() => setActiveTab('7d')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === '7d'
                  ? 'bg-white shadow text-gray-900'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
              disabled={!agent._7Days}
            >
              7 Days
            </button>
          </div>
        </div>
        {metrics ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard
              label="Price"
              value={`$${metrics.price.toFixed(5)}`}
              change={metrics.priceDeltaPercent}
            />
            <MetricCard
              label="Mindshare"
              value={`${metrics.mindshare.toFixed(4)}%`}
              change={metrics.mindshareDeltaPercent}
            />
            <MetricCard
              label="Market Cap"
              value={`$${(metrics.marketCap / 1e6).toFixed(2)}M`}
              change={metrics.marketCapDeltaPercent}
            />
            <MetricCard
              label="Volume (24h)"
              value={`$${(metrics.volume24Hours / 1e6).toFixed(2)}M`}
              change={metrics.volume24HoursDeltaPercent}
            />
            <MetricCard
              label="Holders"
              value={metrics.holdersCount.toString()}
              change={metrics.holdersCountDeltaPercent}
            />
            <MetricCard
              label="Liquidity"
              value={`$${(metrics.liquidity / 1e6).toFixed(2)}M`}
              change={0}
            />
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            No {activeTab === '3d' ? '3-day' : '7-day'} metrics available
          </div>
        )}
      </div>

      <div className="h-px bg-gray-200" />

      {/* Social Metrics */}
      <div className="p-0">
        <h2 className="text-xl font-semibold mb-4">Social Performance</h2>
        {metrics ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard
              label="Avg. Impressions"
              value={metrics.averageImpressionsCount.toLocaleString()}
              change={metrics.averageImpressionsCountDeltaPercent}
            />
            <MetricCard
              label="Avg. Engagements"
              value={metrics.averageEngagementsCount.toLocaleString()}
              change={metrics.averageEngagementsCountDeltaPercent}
            />
            <MetricCard
              label="Smart Followers"
              value={metrics.smartFollowersCount.toLocaleString()}
              change={0}
            />
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            No {activeTab === '3d' ? '3-day' : '7-day'} metrics available
          </div>
        )}
      </div>

      <div className="h-px bg-gray-200" />

      {/* Recent Tweet */}
      {agent.tweets && (
        <div className="p-0">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="p-4">
            <p className="text-gray-800">{agent.tweets.text}</p>
            <div className="mt-2 text-sm text-gray-500 flex gap-4">
              <span>❤️ {agent.tweets.likesCount}</span>
              <span>🔄 {agent.tweets.quotesCount}</span>
              <span>💬 {agent.tweets.repliesCount}</span>
              <span>{new Date(agent.tweets.createdAt).toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: string;
  change: number;
}

function MetricCard({ label, value, change }: MetricCardProps) {
  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <div className="text-sm text-gray-600">{label}</div>
      <div className="text-xl font-bold">{value}</div>
      {change !== 0 && (
        <div
          className={`text-sm ${
            change >= 0 ? 'text-green-500' : 'text-red-500'
          }`}
        >
          {change >= 0 ? '↑' : '↓'} {Math.abs(change).toFixed(2)}%
        </div>
      )}
    </div>
  );
}
