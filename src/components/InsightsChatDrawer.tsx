
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
import { MessageCircle, Send, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const systemPrompt = `You are an analytics assistant specialized in analyzing call center data. Focus on providing insights about:
- Call durations and patterns
- SMS usage and engagement
- Digital identity verification rates
- Task types and closing methods
- Peak times and workload distribution
- Customer service efficiency metrics

When discussing metrics, always use concrete numbers and percentages. Structure your responses clearly and be concise.
Base your analysis only on the available data and highlight any notable trends or anomalies.`;

const InsightsChatDrawer = () => {
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

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg bg-purple-600 hover:bg-purple-700 border-0"
        >
          <MessageCircle className="h-8 w-8 text-white" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-[80vh]">
        <DrawerHeader>
          <DrawerTitle>Analytics Insights</DrawerTitle>
          <DrawerDescription>
            Ask questions about your call center data and get AI-powered insights
          </DrawerDescription>
        </DrawerHeader>
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
