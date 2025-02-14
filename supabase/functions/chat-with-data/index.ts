
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, ChatResponse } from './config.ts';
import { generateEmbedding } from './embeddings.ts';
import { createSupabaseClient, findSimilarDocuments, getSelectedColumns } from './supabase.ts';
import { createDataContext, updateMessages } from './dataContext.ts';
import { generateResponse } from './anthropic.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');

    if (!openAIApiKey) throw new Error('Missing OPENAI_API_KEY');
    if (!supabaseUrl) throw new Error('Missing SUPABASE_URL');
    if (!supabaseServiceKey) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
    if (!anthropicApiKey) throw new Error('Missing ANTHROPIC_API_KEY');

    const supabase = await createSupabaseClient(supabaseUrl, supabaseServiceKey);
    const userQuestion = messages[messages.length - 1].content;

    console.log('Generating embedding for question...');
    const embedding = await generateEmbedding(userQuestion, openAIApiKey);

    console.log('Performing vector similarity search...');
    const similarDocs = await findSimilarDocuments(supabase, embedding);

    console.log('Fetching selected columns...');
    const selectedColumns = await getSelectedColumns(supabase);

    const dataContext = createDataContext(similarDocs, selectedColumns);
    const updatedMessages = updateMessages(messages, dataContext);

    console.log('Making request to Anthropic API...');
    const data = await generateResponse(updatedMessages, anthropicApiKey);

    const response: ChatResponse = {
      generatedText: data.content[0].text,
      usage: {
        model: 'claude-3-opus-20240229',
        input_tokens: data.usage?.input_tokens || 0,
        output_tokens: data.usage?.output_tokens || 0
      }
    };

    return new Response(JSON.stringify(response), {
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
