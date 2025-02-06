'use client';

import { useState } from 'react';
import { Users as UsersIcon } from 'lucide-react';

interface Agent {
  agentName: string;
  // Add other agent properties as needed
  [key: string]: any;
}

interface SearchError {
  message: string;
}

export default function Agents() {
  const [isLoading, setIsLoading] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [error, setError] = useState<SearchError | null>(null);

  async function fetchAgents() {
    setIsLoading(true);
    setError(null);

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
      setAgents(data || []);
    } catch (err) {
      setError({ message: 'Failed to fetch agents. Please try again.' });
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

      {error && (
        <div className="mt-4 text-center text-red-500">{error.message}</div>
      )}

      {agents.length > 0 && (
        <div className="mt-4 space-y-4 overflow-y-auto h-48">
          <h2 className="text-xl font-semibold">Agents</h2>
          {agents.map((agent) => (
            <div
              key={agent.agentName}
              className="p-4 border border-gray-200 rounded-md shadow-sm hover:border-green-500 transition-colors"
            >
              <h3 className="font-medium">{agent.name}</h3>
              <pre className="text-sm overflow-x-auto mt-2">
                {JSON.stringify(agent, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
