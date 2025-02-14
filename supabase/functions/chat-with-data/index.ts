
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

    console.log('Checking environment variables...');
    if (!openAIApiKey) {
      throw new Error('Missing OPENAI_API_KEY');
    }
    if (!supabaseUrl) {
      throw new Error('Missing SUPABASE_URL');
    }
    if (!supabaseServiceKey) {
      throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
    }

    console.log('Creating Supabase client...');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the user's question from the last message
    const userQuestion = messages[messages.length - 1].content;

    // Generate embedding for the question
    console.log('Generating embedding for question...');
    const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: userQuestion,
        model: "text-embedding-3-small"
      }),
    });

    if (!embeddingResponse.ok) {
      throw new Error(`OpenAI API error: ${await embeddingResponse.text()}`);
    }

    const { data: [{ embedding }] } = await embeddingResponse.json();

    // Perform vector similarity search
    console.log('Performing vector similarity search...');
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

    // Get the selected columns for analysis
    console.log('Fetching selected columns...');
    const { data: configData, error: configError } = await supabase
      .from('analysis_config')
      .select('columns')
      .eq('id', 'selected_columns')
      .single();

    if (configError) {
      console.error('Config error:', configError);
      throw new Error(`Config error: ${configError.message}`);
    }

    const selectedColumns = configData?.columns || [
      'teleq_id',
      'created',
      'form_closing',
      'category',
      'call_time_phone',
      'sms_sent',
      'type_of_task_closed',
      'e_identification'
    ];

    // Create a summary of the relevant data
    const summary = {
      totalRelevantCalls: similarDocs.length,
      averageCallDuration: Math.round(
        similarDocs.reduce((acc, doc) => acc + (doc.metadata.call_time_phone || 0), 0) / similarDocs.length
      ),
      relevantClosingMethods: Object.entries(
        similarDocs.reduce((acc, doc) => {
          const method = doc.metadata.form_closing || 'Unknown';
          acc[method] = (acc[method] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      ),
    };

    // Create a data context that focuses on the relevant documents
    const dataContext = `Here is the analysis of the most relevant call logs based on the user's question:

Summary of relevant calls:
- Total relevant calls analyzed: ${summary.totalRelevantCalls}
- Average call duration: ${summary.averageCallDuration} seconds
- Closing methods distribution: ${summary.relevantClosingMethods.map(([method, count]) => 
  `${method}: ${count} calls`).join(', ')}

Sample of relevant call logs:
${JSON.stringify(similarDocs.slice(0, 5).map(doc => doc.metadata), null, 2)}

The data shown above represents the most relevant call logs based on the user's question. 
Available columns for analysis: ${selectedColumns.join(', ')}`;

    // Update the first system message to include the focused data context
    const updatedMessages = messages.map((msg: any, index: number) => {
      if (index === 0 && msg.role === 'system') {
        return {
          ...msg,
          content: `${msg.content}\n\nHere's the relevant data to analyze:\n${dataContext}`
        };
      }
      return msg;
    });

    console.log('Making request to Anthropic API...');
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': Deno.env.get('ANTHROPIC_API_KEY') || '',
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

    return new Response(JSON.stringify({ 
      generatedText: data.content[0].text,
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
