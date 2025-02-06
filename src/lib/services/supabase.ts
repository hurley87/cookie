import { createClient } from '@supabase/supabase-js';
import { AgentAnalysisRecord } from '../../types/agent';

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const supabaseService = {
  async upsertAgentAnalysis(record: AgentAnalysisRecord) {
    const { data, error } = await supabase
      .from('agents')
      .upsert(record, {
        onConflict: 'contract_address',
        ignoreDuplicates: false,
      })
      .select();

    if (error) {
      console.error('Supabase error:', error);
      throw new Error('Failed to save analysis');
    }

    return data;
  },
};
