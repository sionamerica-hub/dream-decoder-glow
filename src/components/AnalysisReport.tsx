import { Sparkles, Brain, Heart, Lightbulb, ArrowRight, MessageCircleHeart, Eye, Shield, Stars } from "lucide-react";
import { GlowCard } from "./ui/GlowCard";
import { cn } from "@/lib/utils";

interface AnalysisReportProps {
  summary?: string;
  dreamType?: string;
  symbols?: Array<{ name: string; meaning: string; emotion?: string }>;
  emotionConnection?: string;
  unconsciousMessage?: string;
  psychologicalInsight?: string;
  advice?: string[];
  comfortMessage?: string;
  isLoading?: boolean;
}

export function AnalysisReport({
  summary,
  dreamType,
  symbols = [],
  emotionConnection,
  unconsciousMessage,
  psychologicalInsight,
  advice = [],
  comfortMessage,
  isLoading = false,
}: AnalysisReportProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div 
            key={i} 
            className="h-32 rounded-2xl bg-card/50 animate-shimmer"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Dream Type Badge */}
      {dreamType && (
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30">
            <Stars className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">{dreamType}</span>
          </div>
        </div>
      )}

      {/* Summary */}
      {summary && (
        <GlowCard variant="accent" glow className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-accent/20 flex-shrink-0">
              <Sparkles className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-lg mb-2">✨ 핵심 메시지</h3>
              <p className="text-foreground/90 leading-relaxed text-[15px]">{summary}</p>
            </div>
          </div>
        </GlowCard>
      )}

      {/* Symbols */}
      {symbols.length > 0 && (
        <GlowCard variant="cool" className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-secondary/20">
              <Brain className="w-5 h-5 text-secondary" />
            </div>
            <h3 className="font-display font-semibold text-lg">🔮 상징 분석</h3>
          </div>
          <div className="space-y-4">
            {symbols.map((symbol, i) => (
              <div 
                key={i}
                className="p-4 rounded-xl bg-muted/30 border border-border/30"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-primary font-bold text-base">"{symbol.name}"</span>
                  {symbol.emotion && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/15 text-primary/80">
                      {symbol.emotion}
                    </span>
                  )}
                </div>
                <p className="text-foreground/80 text-sm leading-relaxed">{symbol.meaning}</p>
              </div>
            ))}
          </div>
        </GlowCard>
      )}

      {/* Emotion Connection */}
      {emotionConnection && (
        <GlowCard variant="warm" className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-orange-500/20">
              <Heart className="w-5 h-5 text-orange-400" />
            </div>
            <h3 className="font-display font-semibold text-lg">💭 감정-사건 연결</h3>
          </div>
          <p className="text-foreground/90 leading-relaxed text-[15px]">{emotionConnection}</p>
        </GlowCard>
      )}

      {/* Unconscious Message */}
      {unconsciousMessage && (
        <GlowCard variant="accent" className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-accent/20">
              <MessageCircleHeart className="w-5 h-5 text-accent" />
            </div>
            <h3 className="font-display font-semibold text-lg">🌊 무의식의 메시지</h3>
          </div>
          <div className="p-4 rounded-xl bg-accent/5 border border-accent/20 italic">
            <p className="text-foreground/90 leading-relaxed text-[15px]">{unconsciousMessage}</p>
          </div>
        </GlowCard>
      )}

      {/* Psychological Insight */}
      {psychologicalInsight && (
        <GlowCard variant="cool" className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-cyan/20">
              <Eye className="w-5 h-5 text-cyan" />
            </div>
            <h3 className="font-display font-semibold text-lg">🧠 심리적 통찰</h3>
          </div>
          <p className="text-foreground/90 leading-relaxed text-[15px]">{psychologicalInsight}</p>
        </GlowCard>
      )}

      {/* Advice */}
      {advice.length > 0 && (
        <GlowCard variant="default" className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-primary/20">
              <Lightbulb className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-display font-semibold text-lg">🌟 오늘의 행동 지침</h3>
          </div>
          <ul className="space-y-3">
            {advice.map((item, i) => (
              <li 
                key={i}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-xl transition-all",
                  "bg-muted/30 hover:bg-muted/50"
                )}
              >
                <span className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="text-foreground/90 text-sm leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </GlowCard>
      )}

      {/* Comfort Message */}
      {comfortMessage && (
        <GlowCard variant="warm" glow className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-orange-500/20">
              <Shield className="w-5 h-5 text-orange-400" />
            </div>
            <h3 className="font-display font-semibold text-lg">🤗 당신에게 보내는 말</h3>
          </div>
          <p className="text-foreground/90 leading-relaxed text-[15px] font-medium">{comfortMessage}</p>
        </GlowCard>
      )}
    </div>
  );
}
