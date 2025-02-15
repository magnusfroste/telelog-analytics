
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { Configuration, OpenAIApi } from 'https://esm.sh/openai@3.3.0';

const openAiKey = Deno.env.get('OPENAI_API_KEY')!;
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const openAI = new OpenAIApi(new Configuration({ apiKey: openAiKey }));
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  try {
    // Fetch all call logs that don't have embeddings yet
    const { data: callLogs, error: fetchError } = await supabase
      .from('call_logs')
      .select('id, teleq_id, created, form_closing, category, type_of_task_closed')
      .not('id', 'in', (
        select('call_log_id')
        .from('call_log_embeddings')
      ));

    if (fetchError) throw fetchError;
    if (!callLogs?.length) {
      return new Response(JSON.stringify({ message: "No new call logs to process" }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log(`Processing ${callLogs.length} call logs`);

    for (const log of callLogs) {
      try {
        // Create text representation of the call log
        const textContent = `
          Call ID: ${log.teleq_id}
          Created: ${log.created}
          Form Closing: ${log.form_closing}
          Category: ${log.category}
          Task Type: ${log.type_of_task_closed}
        `.trim();

        // Generate embedding
        const embeddingResponse = await openAI.createEmbedding({
          model: "text-embedding-3-small",
          input: textContent,
        });

        const [{ embedding }] = embeddingResponse.data.data;

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

        if (insertError) throw insertError;
        
        console.log(`Created embedding for call log ${log.id}`);
      } catch (error) {
        console.error(`Error processing call log ${log.id}:`, error);
      }
    }

    return new Response(
      JSON.stringify({ message: `Successfully processed ${callLogs.length} call logs` }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-embeddings function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
