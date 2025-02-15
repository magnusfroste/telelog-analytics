
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { Configuration, OpenAIApi } from 'https://esm.sh/openai@3.3.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAiKey = Deno.env.get('OPENAI_API_KEY')!;
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const openAI = new OpenAIApi(new Configuration({ apiKey: openAiKey }));
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }

  try {
    // Get all call logs first
    const { data: callLogs, error: fetchError } = await supabase
      .from('call_logs')
      .select('id, teleq_id, created, form_closing, category, type_of_task_closed');

    if (fetchError) throw fetchError;
    if (!callLogs?.length) {
      return new Response(JSON.stringify({ message: "No call logs found" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Found ${callLogs.length} total call logs`);

    // Get existing embeddings
    const { data: existingEmbeddings, error: existingError } = await supabase
      .from('call_log_embeddings')
      .select('call_log_id');

    if (existingError) throw existingError;

    // Filter out logs that already have embeddings
    const existingIds = new Set(existingEmbeddings?.map(e => e.call_log_id) || []);
    const logsToProcess = callLogs.filter(log => !existingIds.has(log.id));

    console.log(`Processing ${logsToProcess.length} new call logs`);

    for (const log of logsToProcess) {
      try {
        // Create text representation of the call log
        const textContent = `
          Call ID: ${log.teleq_id}
          Created: ${log.created}
          Form Closing: ${log.form_closing}
          Category: ${log.category}
          Task Type: ${log.type_of_task_closed}
        `.trim();

        console.log(`Generating embedding for call log ${log.id}`);

        // Generate embedding
        const embeddingResponse = await openAI.createEmbedding({
          model: "text-embedding-3-small",
          input: textContent,
        });

        const [{ embedding }] = embeddingResponse.data.data;

        console.log(`Successfully generated embedding for call log ${log.id}`);

        // Store embedding and metadata
        const { error: insertError } = await supabase
          .from('call_log_embeddings')
          .insert({
            call_log_id: log.id,
            embedding,
            metadata: {
              teleq_id: log.teleq_id,
              created: log.created,
              form_closing: log.form_closing,
              category: log.category,
              type_of_task_closed: log.type_of_task_closed,
            }
          });

        if (insertError) {
          console.error(`Error inserting embedding for call log ${log.id}:`, insertError);
          throw insertError;
        }
        
        console.log(`Successfully stored embedding for call log ${log.id}`);
      } catch (error) {
        console.error(`Error processing call log ${log.id}:`, error);
      }
    }

    return new Response(
      JSON.stringify({ 
        message: `Successfully processed ${logsToProcess.length} call logs`,
        details: {
          total_logs: callLogs.length,
          existing_embeddings: existingIds.size,
          new_processed: logsToProcess.length
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-embeddings function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
