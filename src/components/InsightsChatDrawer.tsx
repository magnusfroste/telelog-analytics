
import React, { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from "@/components/ui/use-toast";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { MessageCircle, Send, Bot, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface TokenUsage {
  model: string;
  input_tokens: number;
  output_tokens: number;
}

interface InsightsChatDrawerProps {
  onTokenUsageUpdate: (usage: TokenUsage) => void;
  systemPrompt: string;
}

const SUGGESTED_QUESTIONS = [
  "What's the correlation between e-identification usage and call duration? Are we spending more time with customers when using e-ID verification?",
  "Can you identify patterns in task types throughout the day? When do we handle more complex tasks vs simple inquiries?",
  "What's the relationship between SMS usage and successful form closings? Do cases with more SMS exchanges have different outcomes?"
];

const InsightsChatDrawer = ({ onTokenUsageUpdate, systemPrompt }: InsightsChatDrawerProps) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage;
    setInputMessage('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('chat-with-data', {
        body: {
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages,
            { role: 'user', content: userMessage }
          ]
        }
      });

      if (error) throw error;

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.generatedText
      }]);

      // Update token usage in the parent component
      if (data.usage) {
        onTokenUsageUpdate(data.usage);
      }
    } catch (error) {
      console.error('Error in chat:', error);
      toast({
        title: "Error",
        description: "Failed to get a response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setInputMessage(question);
  };

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-6 right-6 h-20 w-20 rounded-full shadow-lg bg-purple-600 hover:bg-purple-700 border-0"
        >
          <MessageCircle className="h-12 w-12 text-white" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-[80vh]">
        <DrawerHeader>
          <DrawerTitle>Analytics Insights</DrawerTitle>
          <DrawerDescription>
            Ask questions about your call center data and get AI-powered insights
          </DrawerDescription>
        </DrawerHeader>
        
        {messages.length === 0 && (
          <div className="px-4">
            <div className="mb-4 text-sm font-medium text-gray-500">Suggested questions:</div>
            <div className="space-y-2">
              {SUGGESTED_QUESTIONS.map((question, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="w-full justify-start text-left text-sm h-auto py-2 px-3"
                  onClick={() => handleSuggestedQuestion(question)}
                >
                  <Lightbulb className="h-4 w-4 mr-2 flex-shrink-0 text-purple-500" />
                  <span className="text-gray-600">{question}</span>
                </Button>
              ))}
            </div>
          </div>
        )}

        <ScrollArea className="flex-1 p-4 h-[calc(80vh-180px)]">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-start gap-3 text-sm",
                  message.role === 'assistant' ? "flex-row" : "flex-row-reverse"
                )}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div
                  className={cn(
                    "rounded-lg px-4 py-2 max-w-[80%]",
                    message.role === 'assistant' 
                      ? "bg-muted" 
                      : "bg-primary text-primary-foreground"
                  )}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div>Analyzing data...</div>
              </div>
            )}
          </div>
        </ScrollArea>
        <DrawerFooter className="border-t pt-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <Input
              placeholder="Ask about call patterns, metrics, or trends..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={isLoading}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default InsightsChatDrawer;
