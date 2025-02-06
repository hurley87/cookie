'use client';

import { useState } from 'react';
import { Users as UsersIcon } from 'lucide-react';

export default function Agents() {
  const [isLoading, setIsLoading] = useState(false);

  async function fetchAgents() {
    setIsLoading(true);

    try {
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch agents');
      }

      const { data } = await response.json();
      console.log('data', data);
    } catch (err) {
      console.error('Error fetching agents:', err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-4 overflow-y-auto">
      <div className="flex justify-end">
        <button
          onClick={fetchAgents}
          disabled={isLoading}
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <UsersIcon className="h-5 w-5" />
          {isLoading ? 'Loading...' : 'Get Agents'}
        </button>
      </div>

      {isLoading && (
        <div className="mt-4 text-center text-gray-500">Loading...</div>
      )}
    </div>
  );
}
