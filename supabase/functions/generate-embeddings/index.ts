
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!openAIApiKey) throw new Error('Missing OPENAI_API_KEY');
    if (!supabaseUrl) throw new Error('Missing SUPABASE_URL');
    if (!supabaseServiceKey) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch call logs that don't have embeddings yet
    const { data: callLogs, error: fetchError } = await supabase
      .from('call_logs')
      .select('*')
      .not('id', 'in', (
        supabase
          .from('call_log_embeddings')
          .select('call_log_id')
      ))
      .limit(10); // Process in batches to avoid timeouts

    if (fetchError) throw fetchError;
    if (!callLogs || callLogs.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No new call logs to process' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${callLogs.length} call logs...`);

    // Process each call log
    for (const log of callLogs) {
      // Create a text representation of the call log
      const textContent = [
        `Call ID: ${log.teleq_id}`,
        `Category: ${log.category || 'N/A'}`,
        `Created: ${log.created || 'N/A'}`,
        `Form Closing: ${log.form_closing || 'N/A'}`,
        `Call Duration: ${log.call_time_phone || 0} seconds`,
        `SMS Sent: ${log.sms_sent || 0}`,
        `Task Type: ${log.type_of_task_closed || 'N/A'}`,
        `E-identification: ${log.e_identification ? 'Yes' : 'No'}`,
      ].join('\n');

      // Generate embedding
      const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: textContent,
          model: "text-embedding-3-small"
        }),
      });

      if (!embeddingResponse.ok) {
        console.error(`Error generating embedding for call log ${log.id}`);
        continue;
      }

      const { data: [{ embedding }] } = await embeddingResponse.json();

      // Store embedding and metadata
      const { error: insertError } = await supabase
        .from('call_log_embeddings')
        .insert({
          call_log_id: log.id,
          embedding,
          metadata: {
            teleq_id: log.teleq_id,
            category: log.category,
            created: log.created,
            form_closing: log.form_closing,
            call_time_phone: log.call_time_phone,
            sms_sent: log.sms_sent,
            type_of_task_closed: log.type_of_task_closed,
            e_identification: log.e_identification
          }
        });

      if (insertError) {
        console.error(`Error inserting embedding for call log ${log.id}:`, insertError);
      } else {
        console.log(`Successfully processed call log ${log.id}`);
      }
    }

    return new Response(
      JSON.stringify({ 
        message: `Successfully processed ${callLogs.length} call logs`,
        processedIds: callLogs.map(log => log.id)
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-embeddings function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
