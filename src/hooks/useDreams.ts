import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Dream {
  id: string;
  content: string;
  event: string | null;
  mood_x: number | null;
  mood_y: number | null;
  analysis_summary: string | null;
  analysis_symbols: string | null;
  analysis_emotion: string | null;
  analysis_advice: string | null;
  created_at: string;
  updated_at: string;
}

interface SaveDreamInput {
  content: string;
  events: string[];
  mood: { x: number; y: number };
  analysis: {
    summary: string;
    symbols: Array<{ name: string; meaning: string }>;
    emotionConnection: string;
    advice: string[];
  };
}

export function useDreams() {
  const { user } = useAuth();
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDreams = async () => {
    if (!user) {
      setDreams([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("dreams")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDreams(data || []);
    } catch (error) {
      console.error("Error fetching dreams:", error);
      toast.error("꿈 기록을 불러오는데 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  const saveDream = async (input: SaveDreamInput): Promise<Dream | null> => {
    if (!user) {
      toast.error("로그인이 필요합니다");
      return null;
    }

    try {
      const { data, error } = await supabase
        .from("dreams")
        .insert({
          user_id: user.id,
          content: input.content,
          event: input.events.join(","),
          mood_x: Math.round(input.mood.x),
          mood_y: Math.round(input.mood.y),
          analysis_summary: input.analysis.summary,
          analysis_symbols: JSON.stringify(input.analysis.symbols),
          analysis_emotion: input.analysis.emotionConnection,
          analysis_advice: JSON.stringify(input.analysis.advice),
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("꿈이 저장되었습니다");
      setDreams((prev) => [data, ...prev]);
      return data;
    } catch (error) {
      console.error("Error saving dream:", error);
      toast.error("꿈 저장에 실패했습니다");
      return null;
    }
  };

  const deleteDream = async (dreamId: string): Promise<boolean> => {
    if (!user) {
      toast.error("로그인이 필요합니다");
      return false;
    }

    try {
      const { error } = await supabase.from("dreams").delete().eq("id", dreamId);

      if (error) throw error;

      toast.success("꿈이 삭제되었습니다");
      setDreams((prev) => prev.filter((d) => d.id !== dreamId));
      return true;
    } catch (error) {
      console.error("Error deleting dream:", error);
      toast.error("꿈 삭제에 실패했습니다");
      return false;
    }
  };

  useEffect(() => {
    fetchDreams();
  }, [user]);

  return {
    dreams,
    loading,
    saveDream,
    deleteDream,
    refetch: fetchDreams,
  };
}
