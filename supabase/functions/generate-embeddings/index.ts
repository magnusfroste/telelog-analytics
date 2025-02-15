
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { Configuration, OpenAIApi } from 'https://esm.sh/openai@3.3.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAiKey = Deno.env.get('OPENAI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!openAiKey || !supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing required environment variables');
    }

    console.log('Initializing clients...');
    
    const openAI = new OpenAIApi(new Configuration({ apiKey: openAiKey }));
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Fetching call logs...');
    const { data: callLogs, error: fetchError } = await supabase
      .from('call_logs')
      .select('id, teleq_id, created, form_closing, category, type_of_task_closed');

    if (fetchError) {
      console.error('Error fetching call logs:', fetchError);
      throw fetchError;
    }

    if (!callLogs?.length) {
      console.log('No call logs found in database');
      return new Response(JSON.stringify({ message: "No call logs found" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Found ${callLogs.length} total call logs`);

    console.log('Checking existing embeddings...');
    const { data: existingEmbeddings, error: existingError } = await supabase
      .from('call_log_embeddings')
      .select('call_log_id');

    if (existingError) {
      console.error('Error fetching existing embeddings:', existingError);
      throw existingError;
    }

    const existingIds = new Set(existingEmbeddings?.map(e => e.call_log_id) || []);
    const logsToProcess = callLogs.filter(log => !existingIds.has(log.id));

    console.log(`Found ${existingIds.size} existing embeddings`);
    console.log(`Processing ${logsToProcess.length} new call logs`);

    let successCount = 0;
    let errorCount = 0;

    for (const log of logsToProcess) {
      try {
        const textContent = `
          Call ID: ${log.teleq_id}
          Created: ${log.created}
          Form Closing: ${log.form_closing}
          Category: ${log.category}
          Task Type: ${log.type_of_task_closed}
        `.trim();

        console.log(`Generating embedding for call log ${log.id}...`);

        const embeddingResponse = await openAI.createEmbedding({
          model: "text-embedding-3-small",
          input: textContent,
        });

        const [{ embedding }] = embeddingResponse.data.data;
        
        console.log('Embedding type:', typeof embedding);
        console.log('Embedding length:', embedding.length);
        console.log('First few values:', embedding.slice(0, 5));

        // Insert directly using the embedding array
        const { error: insertError } = await supabase.rpc(
          'insert_embedding',
          {
            p_call_log_id: log.id,
            p_embedding: embedding,
            p_metadata: {
              teleq_id: log.teleq_id,
              created: log.created,
              form_closing: log.form_closing,
              category: log.category,
              type_of_task_closed: log.type_of_task_closed,
              text_content: textContent
            }
          }
        );

        if (insertError) {
          console.error(`Error inserting embedding for call log ${log.id}:`, insertError);
          errorCount++;
          continue;
        }
        
        console.log(`Successfully stored embedding for call log ${log.id}`);
        successCount++;
      } catch (error) {
        console.error(`Error processing call log ${log.id}:`, error);
        errorCount++;
      }
    }

    const summary = {
      message: `Embedding generation complete`,
      details: {
        total_logs: callLogs.length,
        existing_embeddings: existingIds.size,
        logs_processed: logsToProcess.length,
        successful: successCount,
        failed: errorCount
      }
    };

    console.log('Generation summary:', summary);

    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in generate-embeddings function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
