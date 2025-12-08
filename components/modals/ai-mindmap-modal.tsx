"use client";

import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAIMindmap } from "@/hooks/use-ai-mindmap";
import { MindMapData } from "@/lib/ai-mindmap";
import { Loader2, Sparkles, FileText, Lightbulb } from "lucide-react";
import { toast } from "sonner";

interface AIMindmapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (mindMapData: MindMapData) => void;
}

export function AIMindmapModal({ 
  isOpen, 
  onClose, 
  onGenerate 
}: AIMindmapModalProps) {
  const [topic, setTopic] = useState("");
  const [text, setText] = useState("");
  const [complexity, setComplexity] = useState<'simple' | 'detailed' | 'complex'>('detailed');
  const [activeTab, setActiveTab] = useState('topic');
  
  const { generateMindMap, generateFromText, isLoading, error, clearError } = useAIMindmap();

  const handleGenerateFromTopic = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic");
      return;
    }

    const result = await generateMindMap(topic, complexity);
    if (result) {
      onGenerate(result);
      onClose();
      setTopic("");
      toast.success("Mind map generated successfully!");
    } else if (error) {
      toast.error(error);
    }
  };

  const handleGenerateFromText = async () => {
    if (!text.trim()) {
      toast.error("Please enter some text to analyze");
      return;
    }

    const result = await generateFromText(text);
    if (result) {
      onGenerate(result);
      onClose();
      setText("");
      toast.success("Mind map generated from text successfully!");
    } else if (error) {
      toast.error(error);
    }
  };

  const handleClose = () => {
    onClose();
    setTopic("");
    setText("");
    clearError();
  };

  const topicExamples = [
    "Project Management",
    "Machine Learning",
    "Climate Change Solutions",
    "Digital Marketing Strategy",
    "Healthy Lifestyle",
    "Space Exploration"
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-500" />
            Generate AI Mind Map
          </DialogTitle>
          <DialogDescription>
            Create intelligent mind maps using AI. Choose to generate from a topic or analyze existing text.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="topic" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              From Topic
            </TabsTrigger>
            <TabsTrigger value="text" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              From Text
            </TabsTrigger>
          </TabsList>

          <TabsContent value="topic" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Topic</label>
              <Input
                placeholder="Enter a topic (e.g., Project Management, Machine Learning...)"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={isLoading}
              />
              <div className="flex flex-wrap gap-1 mt-2">
                <span className="text-xs text-muted-foreground mr-2">Examples:</span>
                {topicExamples.map((example) => (
                  <button
                    key={example}
                    onClick={() => setTopic(example)}
                    className="text-xs bg-gray-100 dark:bg-neutral-700 hover:bg-gray-200 dark:hover:bg-neutral-600 px-2 py-1 rounded transition-colors text-gray-700 dark:text-gray-300"
                    disabled={isLoading}
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Complexity</label>
              <Select value={complexity} onValueChange={(value: 'simple' | 'detailed' | 'complex') => setComplexity(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="simple">Simple - Basic structure with key points</SelectItem>
                  <SelectItem value="detailed">Detailed - Comprehensive coverage</SelectItem>
                  <SelectItem value="complex">Complex - In-depth with sub-topics</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleGenerateFromTopic} 
              disabled={isLoading || !topic.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Mind Map...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Mind Map
                </>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="text" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Text to Analyze</label>
              <Textarea
                placeholder="Paste your text here and AI will extract key concepts to create a mind map..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={isLoading}
                rows={8}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Enter articles, notes, research, or any text content. AI will identify main themes and relationships.
              </p>
            </div>

            <Button 
              onClick={handleGenerateFromText} 
              disabled={isLoading || !text.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing Text...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Generate from Text
                </>
              )}
            </Button>
          </TabsContent>
        </Tabs>

        {error && (
          <div className="p-3 text-sm bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950/30 p-3 rounded-md border border-blue-100 dark:border-blue-900">
          <div className="font-medium mb-1 text-blue-900 dark:text-blue-300">Powered by Google Gemini Flash 2.5</div>
          <div className="text-gray-600 dark:text-gray-400">AI-generated mind maps help visualize complex topics and relationships between concepts.</div>
        </div>
      </DialogContent>
    </Dialog>
  );
}