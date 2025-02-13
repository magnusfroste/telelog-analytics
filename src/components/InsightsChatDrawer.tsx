
import React, { useState, useEffect, useRef } from 'react';
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
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current;
      scrollContainer.scrollTo({
        top: scrollContainer.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  const splitMessage = (content: string): string[] => {
    const sentences = content.match(/[^.!?]+[.!?]+/g) || [content];
    const chunks: string[] = [];
    let currentChunk = '';
    
    sentences.forEach((sentence, index) => {
      if (currentChunk.length + sentence.length > 200 || index === sentences.length - 1) {
        if (currentChunk) {
          chunks.push(currentChunk.trim());
          currentChunk = sentence;
        } else {
          chunks.push(sentence.trim());
        }
      } else {
        currentChunk += sentence;
      }
    });
    
    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }
    
    return chunks;
  };

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

      const chunks = splitMessage(data.generatedText);
      chunks.forEach((chunk) => {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: chunk
        }]);
      });

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
          className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 border-0"
        >
          <MessageCircle className="h-8 w-8 text-white" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-[85vh] rounded-t-[20px]">
        <DrawerHeader className="border-b border-gray-100">
          <DrawerTitle className="text-2xl font-medium">Hi, I'm Call-e...</DrawerTitle>
          <DrawerDescription className="text-gray-500">
            Ask questions about your call center data and get AI-powered insights
          </DrawerDescription>
        </DrawerHeader>
        
        {messages.length === 0 && (
          <div className="px-6 py-4">
            <div className="mb-4 text-sm font-medium text-gray-500">Suggested questions:</div>
            <div className="space-y-2">
              {SUGGESTED_QUESTIONS.map((question, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="w-full justify-start text-left text-sm h-auto py-3 px-4 rounded-xl hover:bg-blue-50"
                  onClick={() => handleSuggestedQuestion(question)}
                >
                  <Lightbulb className="h-4 w-4 mr-3 flex-shrink-0 text-blue-500" />
                  <span className="text-gray-700">{question}</span>
                </Button>
              ))}
            </div>
          </div>
        )}

        <div 
          ref={scrollAreaRef} 
          className="flex-1 px-6 py-4 h-[calc(85vh-180px)] overflow-y-auto"
        >
          <div className="space-y-6">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-start gap-3",
                  message.role === 'assistant' ? "flex-row" : "flex-row-reverse"
                )}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                )}
                <div
                  className={cn(
                    "rounded-2xl px-4 py-3 max-w-[85%] text-[15px] leading-relaxed shadow-sm",
                    message.role === 'assistant' 
                      ? "bg-gray-100 text-gray-800" 
                      : "bg-blue-500 text-white"
                  )}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center animate-pulse">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div className="text-[15px] text-gray-500">Analyzing data...</div>
              </div>
            )}
          </div>
        </div>
        <DrawerFooter className="border-t border-gray-100 py-4 px-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-3"
          >
            <Input
              placeholder="Ask about call patterns, metrics, or trends..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            />
            <Button 
              type="submit" 
              size="icon"
              disabled={isLoading}
              className="rounded-xl bg-blue-500 hover:bg-blue-600 h-10 w-10"
            >
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default InsightsChatDrawer;
