import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DreamAnalysisInput {
  dreamContent: string;
  events: string[];
  mood: { x: number; y: number };
}

interface DreamAnalysisResult {
  summary: string;
  symbols: Array<{ name: string; meaning: string }>;
  emotionConnection: string;
  advice: string[];
}

export function useDreamAnalysis() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DreamAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeDream = async (input: DreamAnalysisInput): Promise<DreamAnalysisResult | null> => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("analyze-dream", {
        body: input,
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data.error) {
        if (data.error.includes("429") || data.error.includes("너무 많습니다")) {
          toast.error("요청이 너무 많습니다. 잠시 후 다시 시도해주세요.");
        } else if (data.error.includes("402") || data.error.includes("크레딧")) {
          toast.error("AI 크레딧이 부족합니다.");
        } else {
          toast.error("분석 중 오류가 발생했습니다.");
        }
        setError(data.error);
        return null;
      }

      setResult(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "분석 중 오류가 발생했습니다.";
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setError(null);
    setIsLoading(false);
  };

  return {
    analyzeDream,
    isLoading,
    result,
    error,
    reset,
  };
}
