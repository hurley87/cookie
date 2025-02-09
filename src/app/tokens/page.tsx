import { AgentFeed } from '@/components/agent-feed';

async function fetchAnalystFeed() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/analyst`,
      { cache: 'no-store' }
    );
    if (!response.ok) throw new Error('Failed to fetch agents');

    const data = await response.json();
    return data;
  } catch (err) {
    console.error('Error fetching agents:', err);
    return null;
  }
}

export default async function Home() {
  const agents = (await fetchAnalystFeed()) || [];

  return <AgentFeed agents={agents} />;
}
