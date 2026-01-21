import { Sparkles, Brain, Heart, Lightbulb, ArrowRight } from "lucide-react";
import { GlowCard } from "./ui/GlowCard";
import { cn } from "@/lib/utils";

interface AnalysisReportProps {
  summary?: string;
  symbols?: Array<{ name: string; meaning: string }>;
  emotionConnection?: string;
  advice?: string[];
  isLoading?: boolean;
}

export function AnalysisReport({
  summary = "당신의 꿈은 새로운 시작에 대한 무의식적 열망을 나타냅니다.",
  symbols = [
    { name: "바다", meaning: "무의식과 감정의 깊이를 상징합니다" },
    { name: "비행", meaning: "자유에 대한 갈망과 현실 초월의 욕구를 나타냅니다" },
  ],
  emotionConnection = "최근 업무 스트레스와 연결되어, 현실에서 벗어나고 싶은 마음이 꿈에 투영된 것으로 보입니다.",
  advice = [
    "하루 10분 명상으로 마음을 정리해 보세요",
    "자연 속에서 산책하며 에너지를 충전하세요",
    "오늘 하루 감사한 일 3가지를 적어보세요",
  ],
  isLoading = false,
}: AnalysisReportProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div 
            key={i} 
            className="h-32 rounded-2xl bg-card/50 animate-shimmer"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <GlowCard variant="accent" glow className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-accent/20">
            <Sparkles className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-lg mb-2">핵심 메시지</h3>
            <p className="text-foreground/90 leading-relaxed">{summary}</p>
          </div>
        </div>
      </GlowCard>

      {/* Symbols */}
      <GlowCard variant="cool" className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-secondary/20">
            <Brain className="w-5 h-5 text-secondary" />
          </div>
          <h3 className="font-display font-semibold text-lg">상징 분석</h3>
        </div>
        <div className="space-y-3">
          {symbols.map((symbol, i) => (
            <div 
              key={i}
              className="flex items-start gap-3 p-3 rounded-xl bg-muted/30"
            >
              <span className="text-primary font-semibold">"{symbol.name}"</span>
              <ArrowRight className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
              <span className="text-foreground/80">{symbol.meaning}</span>
            </div>
          ))}
        </div>
      </GlowCard>

      {/* Emotion Connection */}
      <GlowCard variant="warm" className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-orange-500/20">
            <Heart className="w-5 h-5 text-orange-400" />
          </div>
          <h3 className="font-display font-semibold text-lg">감정-사건 연결</h3>
        </div>
        <p className="text-foreground/90 leading-relaxed">{emotionConnection}</p>
      </GlowCard>

      {/* Advice */}
      <GlowCard variant="default" className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-primary/20">
            <Lightbulb className="w-5 h-5 text-primary" />
          </div>
          <h3 className="font-display font-semibold text-lg">오늘의 행동 지침</h3>
        </div>
        <ul className="space-y-3">
          {advice.map((item, i) => (
            <li 
              key={i}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl transition-all",
                "bg-muted/30 hover:bg-muted/50"
              )}
            >
              <span className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-bold text-white">
                {i + 1}
              </span>
              <span className="text-foreground/90">{item}</span>
            </li>
          ))}
        </ul>
      </GlowCard>
    </div>
  );
}
