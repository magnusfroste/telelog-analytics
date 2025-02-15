
import { createClient } from '@supabase/supabase-js';
import { Configuration, OpenAIApi } from 'openai';

interface CallLogMatch {
  id: number;
  similarity: number;
  metadata: {
    teleq_id: number;
    created: string;
    form_closing: string;
    category: string;
    type_of_task_closed: string;
  };
}

export async function findSimilarCallLogs(
  queryText: string,
  openaiApiKey: string,
  supabaseUrl: string,
  supabaseKey: string,
  matchThreshold = 0.7,
  matchCount = 5
): Promise<CallLogMatch[]> {
  const openai = new OpenAIApi(new Configuration({ apiKey: openaiApiKey }));
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Generate embedding for the query text
    const embeddingResponse = await openai.createEmbedding({
      model: "text-embedding-3-small",
      input: queryText.replace(/\n/g, " "),
    });

    const [{ embedding }] = embeddingResponse.data.data;

    // Use the match_call_logs function to find similar logs
    const { data: matches, error } = await supabase
      .rpc('match_call_logs', {
        query_embedding: embedding,
        match_threshold: matchThreshold,
        match_count: matchCount
      });

    if (error) {
      console.error('Error finding similar call logs:', error);
      throw error;
    }

    return matches || [];
  } catch (error) {
    console.error('Error in findSimilarCallLogs:', error);
    throw error;
  }
}
