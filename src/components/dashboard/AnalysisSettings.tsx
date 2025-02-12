
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

const AnalysisSettings = ({
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
