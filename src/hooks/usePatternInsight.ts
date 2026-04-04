import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Dream } from "./useDreams";

export interface PatternInsight {
  recurringTheme: string;
  emotionShift: string;
  recommendedAction: string;
}

interface PatternInsightCache {
  generatedAt: string;
  dreamCount: number;
  insight: PatternInsight;
}

const getCacheKey = () => `pattern_insight_${format(new Date(), "yyyy-MM")}`;

function loadCache(): PatternInsightCache | null {
  try {
    const raw = localStorage.getItem(getCacheKey());
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveCache(data: PatternInsightCache) {
  try {
    localStorage.setItem(getCacheKey(), JSON.stringify(data));
  } catch {
    // quota exceeded - clean old caches
    const keys = Object.keys(localStorage).filter((k) => k.startsWith("pattern_insight_"));
    keys.sort().slice(0, -2).forEach((k) => localStorage.removeItem(k));
    try {
      localStorage.setItem(getCacheKey(), JSON.stringify(data));
    } catch {}
  }
}

export function usePatternInsight(dreams: Dream[]) {
  const [insight, setInsight] = useState<PatternInsight | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzedDreams = dreams.filter((d) => d.analysis);

  useEffect(() => {
    if (analyzedDreams.length < 5) return;
    const cached = loadCache();
    if (cached) {
      setInsight(cached.insight);
    }
  }, [analyzedDreams.length]);

  const fetchInsight = useCallback(async () => {
    if (analyzedDreams.length < 5) return;
    setIsLoading(true);
    setError(null);

    const inputDreams = analyzedDreams.slice(0, 10).map((d) => ({
      summary: d.analysis!.summary,
      dreamType: d.analysis!.dreamType,
      symbols: d.analysis!.symbols?.map((s) => s.name) || [],
      moodX: d.mood_x,
      moodY: d.mood_y,
    }));

    try {
      const { data, error: fnError } = await supabase.functions.invoke("pattern-insight", {
        body: { dreams: inputDreams },
      });

      if (fnError) throw new Error(fnError.message);
      if (data.error) throw new Error(data.error);

      const parsed: PatternInsight = data;
      setInsight(parsed);
      saveCache({
        generatedAt: new Date().toISOString(),
        dreamCount: analyzedDreams.length,
        insight: parsed,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "인사이트 생성에 실패했습니다");
    } finally {
      setIsLoading(false);
    }
  }, [analyzedDreams]);

  return { insight, isLoading, error, refetch: fetchInsight, isAvailable: analyzedDreams.length >= 5 };
}
