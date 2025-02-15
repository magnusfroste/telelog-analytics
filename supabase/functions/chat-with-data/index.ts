
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ChatMessage, createChatCompletion } from "./anthropic.ts";
import { findSimilarCallLogs } from "./embeddings.ts";
import { getDataContext } from "./dataContext.ts";
import { corsHeaders } from "./config.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { messages, systemPrompt } = await req.json();

    // Get environment variables
    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY');
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    // Check if all required environment variables are present
    if (!anthropicKey || !openaiKey || !supabaseUrl || !supabaseKey) {
      throw new Error('Missing required environment variables');
    }

    // Get the last user message
    const lastUserMessage = messages.findLast((m: ChatMessage) => m.role === 'user');
    if (!lastUserMessage) {
      throw new Error('No user message found');
    }

    // Find similar call logs
    const similarLogs = await findSimilarCallLogs(
      lastUserMessage.content,
      openaiKey,
      supabaseUrl,
      supabaseKey
    );

    // Get data context from similar logs
    const dataContext = getDataContext(similarLogs);

    // Prepare the messages array with system prompt and context
    const contextualMessages: ChatMessage[] = [
      {
        role: 'system',
        content: `${systemPrompt}\n\nContext from similar call logs:\n${dataContext}`,
      },
      ...messages,
    ];

    // Get the chat completion
    const completion = await createChatCompletion(contextualMessages, anthropicKey);

    return new Response(
      JSON.stringify({ completion }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
