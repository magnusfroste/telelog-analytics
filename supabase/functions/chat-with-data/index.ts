
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
    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    console.log('Checking environment variables...');
    if (!anthropicApiKey) {
      throw new Error('Missing ANTHROPIC_API_KEY');
    }
    if (!supabaseUrl) {
      throw new Error('Missing SUPABASE_URL');
    }
    if (!supabaseServiceKey) {
      throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
    }

    console.log('Creating Supabase client...');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Fetching call logs...');
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
      .limit(10000); // Updated to fetch all 10,000 rows

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error(`Database error: ${dbError.message}`);
    }

    console.log(`Retrieved ${callLogs?.length || 0} call logs`);

    // Create a comprehensive summary of the data
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

    // Add detailed data summary to the system message
    const dataContext = `Here is the comprehensive call center data summary (based on all ${callLogs.length} records):
- Average call duration: ${summary.avgCallDuration} seconds
- Total SMS messages: ${summary.totalSMS}
- E-identification rate: ${summary.eIdRate}%
- Task types distribution: ${summary.taskTypes.map(([type, count]) => `${type}: ${count}`).join(', ')}
- Closing methods: ${summary.closingMethods.map(([method, count]) => `${method}: ${count}`).join(', ')}

Raw data sample (showing first 15 records for context):
${JSON.stringify(callLogs.slice(0, 15), null, 2)}

Full dataset contains ${callLogs.length} records for comprehensive analysis.`;

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

    console.log('Making request to Anthropic API...');
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-opus-20240229',
        max_tokens: 1000,
        messages: updatedMessages.map((msg: any) => ({
          role: msg.role === 'system' ? 'user' : msg.role,
          content: msg.content
        })),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Anthropic API error:', errorText);
      throw new Error(`Anthropic API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('Anthropic API response received');

    if (!data.content || !data.content[0] || !data.content[0].text) {
      console.error('Unexpected API response format:', data);
      throw new Error('Invalid response format from Anthropic API');
    }

    const generatedText = data.content[0].text;

    return new Response(JSON.stringify({ 
      generatedText,
      usage: {
        model: 'claude-3-opus-20240229',
        input_tokens: data.usage?.input_tokens || 0,
        output_tokens: data.usage?.output_tokens || 0
      }
    }), {
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
