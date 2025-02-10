'use client';

import { useState } from 'react';
import { z } from 'zod';

// Trade request schema
const tradeRequestSchema = z.object({
  trade: z.object({
    amount: z.string(),
    trade_action: z.enum(['BUY', 'SELL']),
    name: z.string(),
    contract_address: z.string(),
  }),
  tradeId: z.string(),
});

type TradeRequest = z.infer<typeof tradeRequestSchema>;

export function TradeTestButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleTestTrade = async () => {
    setIsLoading(true);
    try {
      // Sample trade data for testing
      const tradeData: TradeRequest = {
        trade: {
          amount: '0.0001',
          trade_action: 'BUY',
          name: 'VVV',
          contract_address: '0xacfE6019Ed1A7Dc6f7B508C02d1b04ec88cC21bf',
        },
        tradeId: crypto.randomUUID(),
      };

      const response = await fetch('/api/trade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tradeData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to execute trade');
      }

      // Show success message
      alert(`Trade executed successfully! Trade ID: ${data.trade_id}`);
    } catch (error) {
      console.error('Trade execution error:', error);
      // Show error message
      alert(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleTestTrade}
      disabled={isLoading}
      className={`
        inline-flex items-center gap-2 px-4 py-2 
        bg-gradient-to-r from-blue-500 to-blue-600 
        hover:from-blue-600 hover:to-blue-700 
        text-white font-medium rounded-lg shadow-md 
        hover:shadow-lg transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Processing Trade...
        </>
      ) : (
        <>
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          Test Trade Execution
        </>
      )}
    </button>
  );
}
