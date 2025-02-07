import { supabaseService } from '@/lib/services/supabase';
import Link from 'next/link';

// Revalidate every minute
export const revalidate = 60;

type TradeAction = 'BUY' | 'SELL' | 'HOLD';
type ConvictionLevel = 'HIGH' | 'MEDIUM' | 'LOW';
type TimeHorizon = 'SHORT' | 'MEDIUM' | 'LONG';

interface Trade {
  id: string;
  created_at: string;
  name: string;
  token_contract: string;
  trade_action: TradeAction;
  conviction_level: ConvictionLevel;
  time_horizon: TimeHorizon;
  allocation_percentage: number;
  justification: string;
}

const positionColor: Record<TradeAction, string> = {
  BUY: 'bg-green-100 text-green-700 border-green-200',
  SELL: 'bg-red-100 text-red-700 border-red-200',
  HOLD: 'bg-yellow-100 text-yellow-700 border-yellow-200',
};

const positionEmoji: Record<TradeAction, string> = {
  BUY: '🚀',
  SELL: '🔻',
  HOLD: '⏳',
};

const convictionColor: Record<ConvictionLevel, string> = {
  HIGH: 'bg-purple-100 text-purple-700 border-purple-200',
  MEDIUM: 'bg-blue-100 text-blue-700 border-blue-200',
  LOW: 'bg-gray-100 text-gray-700 border-gray-200',
};

const timeHorizonColor: Record<TimeHorizon, string> = {
  SHORT: 'bg-orange-100 text-orange-700 border-orange-200',
  MEDIUM: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  LONG: 'bg-indigo-100 text-indigo-700 border-indigo-200',
};

async function getTrades(): Promise<Trade[]> {
  const { data: trades, error } = await supabaseService
    .from('trades')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching trades:', error);
    return [];
  }

  return trades as Trade[];
}

export default async function TradesPage() {
  const trades = await getTrades();

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="grid gap-6">
        {trades.map((trade) => (
          <div
            key={trade.id}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <div className="px-6 py-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {trade.name}
                </h2>
                <Link
                  href={`https://dexscreener.com/base/${trade.token_contract}`}
                  target="_blank"
                  className="text-sm text-blue-500 hover:text-blue-600 hover:underline inline-flex items-center gap-1"
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

              <div className="flex flex-wrap gap-3">
                <span
                  className={`px-3 py-1 rounded-lg border text-sm font-medium ${
                    positionColor[trade.trade_action]
                  } inline-flex items-center gap-1`}
                >
                  <span>{positionEmoji[trade.trade_action]}</span>
                  {trade.trade_action}
                </span>
                <span
                  className={`px-3 py-1 rounded-lg border text-sm font-medium ${
                    convictionColor[trade.conviction_level]
                  }`}
                >
                  {trade.conviction_level} Conviction
                </span>
                <span
                  className={`px-3 py-1 rounded-lg border text-sm font-medium ${
                    timeHorizonColor[trade.time_horizon]
                  }`}
                >
                  {trade.time_horizon} Term
                </span>
              </div>

              {trade.justification && (
                <div className="mt-4 text-gray-600 text-sm bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <p className="whitespace-pre-wrap">{trade.justification}</p>
                </div>
              )}

              <div className="mt-4 text-xs text-gray-500">
                Executed {new Date(trade.created_at).toLocaleString()}
              </div>
            </div>
          </div>
        ))}

        {trades.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-600">No trades found</p>
          </div>
        )}
      </div>
    </main>
  );
}
