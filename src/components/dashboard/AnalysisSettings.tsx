
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useToast } from "@/components/ui/use-toast";

interface AnalysisSettingsProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  defaultSystemPrompt: string;
  systemPrompt: string;
  onSystemPromptChange: (prompt: string) => void;
}

const DEFAULT_INSTRUCTIONS = `Important Context:
- The system uses vector search to find the most relevant call logs for each question
- Only the top 10 most similar call logs are provided in the context
- A statistical summary of these relevant calls is included
- Available columns and data points are listed in the context

Tips for better results:
- Be specific in your questions
- Focus on patterns and trends in the data
- Compare different aspects of calls (e.g., duration, methods, outcomes)
- Ask about relationships between different data points`;

export const AnalysisSettings = ({
  isOpen,
  onOpenChange,
  defaultSystemPrompt,
  systemPrompt,
  onSystemPromptChange,
}: AnalysisSettingsProps) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [tempPrompt, setTempPrompt] = useState(systemPrompt);

  const handleSavePrompt = () => {
    onSystemPromptChange(tempPrompt);
    setIsEditing(false);
    toast({
      title: "Success",
      description: "System prompt has been updated",
    });
  };

  const handleResetPrompt = () => {
    setTempPrompt(defaultSystemPrompt);
    onSystemPromptChange(defaultSystemPrompt);
    setIsEditing(false);
    toast({
      title: "Success",
      description: "System prompt has been reset to default",
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-[90vw] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Analysis Settings</SheetTitle>
          <SheetDescription>
            Customize how the AI analyzes your call center data
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">Instructions</h3>
            <p className="text-sm text-blue-700 whitespace-pre-line">
              {DEFAULT_INSTRUCTIONS}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">System Prompt</label>
            <Textarea
              value={tempPrompt}
              onChange={(e) => {
                setTempPrompt(e.target.value);
                setIsEditing(true);
              }}
              className="h-[300px]"
              placeholder="Enter system prompt..."
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleResetPrompt}>
              Reset to Default
            </Button>
            <Button onClick={handleSavePrompt} disabled={!isEditing}>
              Save Changes
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AnalysisSettings;
