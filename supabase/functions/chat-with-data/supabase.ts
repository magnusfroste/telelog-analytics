
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export interface SimilarDoc {
  id: number;
  similarity: number;
  metadata: Record<string, any>;
}

export async function createSupabaseClient(url: string, key: string) {
  return createClient(url, key);
}

export async function getSelectedColumns(supabase: any) {
  const { data: configData, error: configError } = await supabase
    .from('analysis_config')
    .select('columns')
    .eq('id', 'selected_columns')
    .single();

  if (configError) {
    console.error('Config error:', configError);
    throw new Error(`Config error: ${configError.message}`);
  }

  return configData?.columns || [
    'teleq_id',
    'created',
    'form_closing',
    'category',
    'call_time_phone',
    'sms_sent',
    'type_of_task_closed',
    'e_identification'
  ];
}

export async function findSimilarDocuments(supabase: any, embedding: number[]) {
  const { data: similarDocs, error: searchError } = await supabase.rpc(
    'match_call_logs',
    {
      query_embedding: embedding,
      match_threshold: 0.5,
      match_count: 10
    }
  );

  if (searchError) {
    console.error('Search error:', searchError);
    throw new Error(`Search error: ${searchError.message}`);
  }

  return similarDocs;
}
