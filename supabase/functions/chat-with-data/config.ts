
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export interface ChatMessage {
  role: string;
  content: string;
}

export interface TokenUsage {
  model: string;
  input_tokens: number;
  output_tokens: number;
}

export interface ChatResponse {
  generatedText: string;
  usage: TokenUsage;
}
