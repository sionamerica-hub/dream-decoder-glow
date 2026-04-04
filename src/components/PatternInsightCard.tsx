import { RefreshCw, Sparkles, TrendingUp, Lightbulb } from "lucide-react";
import { GlowCard } from "@/components/ui/GlowCard";
import { Button } from "@/components/ui/button";
import { PatternInsight } from "@/hooks/usePatternInsight";
import { cn } from "@/lib/utils";

interface PatternInsightCardProps {
  insight: PatternInsight | null;
  isLoading: boolean;
  error: string | null;
  isAvailable: boolean;
  onRefresh: () => void;
}

export function PatternInsightCard({ insight, isLoading, error, isAvailable, onRefresh }: PatternInsightCardProps) {
  if (!isAvailable) return null;

  if (!insight && !isLoading) {
    return (
      <GlowCard variant="accent" glow className="p-5">
        <div className="text-center space-y-3">
          <Sparkles className="w-8 h-8 text-primary mx-auto" />
          <h3 className="font-display font-semibold">이번 달 무의식 패턴 분석</h3>
          <p className="text-sm text-muted-foreground">
            AI가 누적된 꿈 기록을 분석하여 패턴을 찾아드려요
          </p>
          <Button
            onClick={onRefresh}
            className="bg-gradient-to-r from-primary to-accent rounded-xl"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            인사이트 생성하기
          </Button>
        </div>
      </GlowCard>
    );
  }

  if (isLoading) {
    return (
      <GlowCard variant="accent" className="p-5">
        <div className="text-center space-y-3 py-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent animate-pulse mx-auto" />
          <p className="text-sm text-muted-foreground">AI가 패턴을 분석하고 있어요...</p>
        </div>
      </GlowCard>
    );
  }

  if (error) {
    return (
      <GlowCard variant="default" className="p-5">
        <div className="text-center space-y-3">
          <p className="text-sm text-destructive">{error}</p>
          <Button variant="outline" size="sm" onClick={onRefresh}>
            다시 시도
          </Button>
        </div>
      </GlowCard>
    );
  }

  if (!insight) return null;

  const cards = [
    { icon: Sparkles, title: "반복 테마", content: insight.recurringTheme, variant: "accent" as const },
    { icon: TrendingUp, title: "감정 변화", content: insight.emotionShift, variant: "cool" as const },
    { icon: Lightbulb, title: "추천 행동", content: insight.recommendedAction, variant: "warm" as const },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold text-lg">✨ 이번 달 인사이트</h3>
        <Button variant="ghost" size="icon" onClick={onRefresh} className="text-muted-foreground">
          <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
        </Button>
      </div>
      {cards.map((card) => (
        <GlowCard key={card.title} variant={card.variant} className="p-4">
          <div className="flex items-start gap-3">
            <card.icon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-sm mb-1">{card.title}</h4>
              <p className="text-foreground/80 text-sm leading-relaxed">{card.content}</p>
            </div>
          </div>
        </GlowCard>
      ))}
    </div>
  );
}
