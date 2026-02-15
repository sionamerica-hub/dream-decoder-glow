import { useState, useEffect } from "react";
import { toast } from "sonner";

export interface DreamAnalysis {
  summary: string;
  dreamType: string;
  symbols: Array<{ name: string; meaning: string; emotion: string }>;
  emotionConnection: string;
  unconsciousMessage: string;
  psychologicalInsight: string;
  advice: string[];
  comfortMessage: string;
}

export interface Dream {
  id: string;
  content: string;
  event: string | null;
  mood_x: number | null;
  mood_y: number | null;
  analysis: DreamAnalysis | null;
  created_at: string;
}

interface SaveDreamInput {
  content: string;
  events: string[];
  mood: { x: number; y: number };
  analysis: DreamAnalysis;
}

const STORAGE_KEY = "dream-decoder-dreams";

function loadDreams(): Dream[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persistDreams(dreams: Dream[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dreams));
}

export function useDreams() {
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setDreams(loadDreams());
    setLoading(false);
  }, []);

  const saveDream = async (input: SaveDreamInput): Promise<Dream | null> => {
    try {
      const newDream: Dream = {
        id: crypto.randomUUID(),
        content: input.content,
        event: input.events.join(","),
        mood_x: Math.round(input.mood.x),
        mood_y: Math.round(input.mood.y),
        analysis: input.analysis,
        created_at: new Date().toISOString(),
      };

      const updated = [newDream, ...dreams];
      setDreams(updated);
      persistDreams(updated);
      toast.success("꿈이 저장되었습니다 ✨");
      return newDream;
    } catch (error) {
      console.error("Error saving dream:", error);
      toast.error("꿈 저장에 실패했습니다");
      return null;
    }
  };

  const deleteDream = async (dreamId: string): Promise<boolean> => {
    try {
      const updated = dreams.filter((d) => d.id !== dreamId);
      setDreams(updated);
      persistDreams(updated);
      toast.success("꿈이 삭제되었습니다");
      return true;
    } catch (error) {
      console.error("Error deleting dream:", error);
      toast.error("꿈 삭제에 실패했습니다");
      return false;
    }
  };

  return {
    dreams,
    loading,
    saveDream,
    deleteDream,
  };
}
