
import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { messages } = await req.json();
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!openAIApiKey || !supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing required environment variables');
    }

    // Create Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch call logs with only necessary fields
    const { data: callLogs, error: dbError } = await supabase
      .from('call_logs')
      .select(`
        call_time_phone,
        call_time_video,
        sms_sent,
        sms_received,
        e_identification,
        form_closing,
        type_of_task_created,
        type_of_task_closed,
        created
      `)
      .order('created', { ascending: false })
      .limit(50); // Reduced limit to save tokens

    if (dbError) {
      throw new Error(`Database error: ${dbError.message}`);
    }

    // Create a more concise summary of the data
    const summary = {
      totalCalls: callLogs.length,
      avgCallDuration: Math.round(
        callLogs.reduce((acc, log) => acc + (log.call_time_phone || 0), 0) / callLogs.length
      ),
      totalSMS: callLogs.reduce((acc, log) => acc + (log.sms_sent || 0) + (log.sms_received || 0), 0),
      eIdRate: Math.round(
        (callLogs.filter(log => log.e_identification).length / callLogs.length) * 100
      ),
      taskTypes: Object.entries(
        callLogs.reduce((acc, log) => {
          const type = log.type_of_task_created || 'Unknown';
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      ),
      closingMethods: Object.entries(
        callLogs.reduce((acc, log) => {
          const method = log.form_closing || 'Unknown';
          acc[method] = (acc[method] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      )
    };

    // Add data summary to the system message
    const dataContext = `Here is the call center data summary (based on last ${callLogs.length} records):
- Average call duration: ${summary.avgCallDuration} seconds
- Total SMS messages: ${summary.totalSMS}
- E-identification rate: ${summary.eIdRate}%
- Task types distribution: ${summary.taskTypes.map(([type, count]) => `${type}: ${count}`).join(', ')}
- Closing methods: ${summary.closingMethods.map(([method, count]) => `${method}: ${count}`).join(', ')}

Raw data sample (first 5 records):
${JSON.stringify(callLogs.slice(0, 5), null, 2)}`;

    // Update the first system message to include the data
    const updatedMessages = messages.map((msg: any, index: number) => {
      if (index === 0 && msg.role === 'system') {
        return {
          ...msg,
          content: `${msg.content}\n\nHere's the data to analyze:\n${dataContext}`
        };
      }
      return msg;
    });

    console.log('Making request to OpenAI API...');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: updatedMessages,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('OpenAI API response:', data);

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Unexpected API response format:', data);
      throw new Error('Invalid response format from OpenAI API');
    }

    const generatedText = data.choices[0].message.content;

    return new Response(JSON.stringify({ generatedText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in chat-with-data function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error instanceof Error ? error.stack : undefined 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
