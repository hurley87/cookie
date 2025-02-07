import { notFound } from 'next/navigation';
import { supabaseService } from '@/lib/services/supabase';
import { AgentAnalysisRecord } from '@/types/agent';
import AgentAnalysisView from '../../components/agent-analysis-view';
import Link from 'next/link';

export const revalidate = 60; // Revalidate every minute

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

export default async function AgentPage({
  params,
}: {
  params: { id: string };
}) {
  // Explicitly await the entire params object
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
      <AgentAnalysisView agent={agent} />
    </main>
  );
}
