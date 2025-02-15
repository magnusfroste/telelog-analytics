
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";

export function GenerateEmbeddings() {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateEmbeddings = async () => {
    try {
      setIsGenerating(true);
      const { data, error } = await supabase.functions.invoke('generate-embeddings');
      
      if (error) {
        console.error('Error generating embeddings:', error);
        toast.error('Failed to generate embeddings');
        return;
      }

      console.log('Generation result:', data);
      toast.success('Successfully generated embeddings');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to generate embeddings');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button 
      onClick={generateEmbeddings}
      disabled={isGenerating}
    >
      {isGenerating ? 'Generating...' : 'Generate Embeddings'}
    </Button>
  );
}
