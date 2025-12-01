import { useState } from 'react';
import { MindMapData } from '@/lib/ai-mindmap';

export interface UseAIMindmapReturn {
  generateMindMap: (topic: string, complexity?: 'simple' | 'detailed' | 'complex') => Promise<MindMapData | null>;
  generateFromText: (text: string) => Promise<MindMapData | null>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export function useAIMindmap(): UseAIMindmapReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const generateMindMap = async (
    topic: string, 
    complexity: 'simple' | 'detailed' | 'complex' = 'detailed'
  ): Promise<MindMapData | null> => {
    if (!topic.trim()) {
      setError('Topic cannot be empty');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai-mindmap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: topic.trim(),
          complexity,
          type: 'topic'
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      if (!data.success || !data.data) {
        throw new Error('Invalid response format');
      }

      return data.data;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate mind map';
      setError(errorMessage);
      console.error('Mind map generation error:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const generateFromText = async (text: string): Promise<MindMapData | null> => {
    if (!text.trim()) {
      setError('Text cannot be empty');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai-mindmap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: text.trim(),
          type: 'text'
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      if (!data.success || !data.data) {
        throw new Error('Invalid response format');
      }

      return data.data;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate mind map from text';
      setError(errorMessage);
      console.error('Mind map generation error:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    generateMindMap,
    generateFromText,
    isLoading,
    error,
    clearError
  };
}