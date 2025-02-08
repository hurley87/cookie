'use client';

import { useState } from 'react';

interface TradeRecommendation {
  trade_action: 'BUY' | 'SELL';
  name: string;
  token_contract: string;
}

export function TradeTestButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTestTrade = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    const recommendation: TradeRecommendation = {
      trade_action: 'BUY',
      name: 'Bankr',
      token_contract: '0x22aF33FE49fD1Fa80c7149773dDe5890D3c76F3b', // Example contract address
    };

    try {
      const response = await fetch('/api/trade-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ recommendation }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to execute trade test');
      }

      setResult(JSON.stringify(data, null, 2));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={handleTestTrade}
        disabled={isLoading}
        className={`px-4 py-2 rounded-md font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto ${
          isLoading ? 'cursor-not-allowed' : ''
        }`}
      >
        {isLoading ? 'Testing Trade...' : 'Test Trade'}
      </button>

      {error && (
        <div className="p-4 rounded-md bg-red-50 border border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {result && (
        <div className="p-4 rounded-md bg-green-50 border border-green-200">
          <pre className="text-sm text-green-700 whitespace-pre-wrap">
            {result}
          </pre>
        </div>
      )}
    </div>
  );
}
