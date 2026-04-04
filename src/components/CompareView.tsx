import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { ArrowLeft, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Dream } from "@/hooks/useDreams";
import { AnalysisReport } from "@/components/AnalysisReport";
import { GlowCard } from "@/components/ui/GlowCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getMoodDiff, MoodDiff } from "@/lib/dreamAnalytics";
import { cn } from "@/lib/utils";

function MoodDiffBadge({ diff }: { diff: MoodDiff }) {
  const config = {
    improved: {
      icon: TrendingUp,
      text: "감정이 긍정 방향으로 변화했어요",
      className: "text-green-400 bg-green-400/10 border-green-400/30",
    },
    worsened: {
      icon: TrendingDown,
      text: "감정 변화를 살펴볼 필요가 있어요",
      className: "text-red-400 bg-red-400/10 border-red-400/30",
    },
    neutral: {
      icon: Minus,
      text: "감정 상태가 비슷한 시기예요",
      className: "text-muted-foreground bg-muted/30 border-border/30",
    },
  };

  const c = config[diff.sentiment];
  const Icon = c.icon;

  return (
    <div className={cn("flex items-center gap-3 px-4 py-3 rounded-xl border", c.className)}>
      <Icon className="w-5 h-5 flex-shrink-0" />
      <div>
        <p className="text-sm font-medium">{c.text}</p>
        <p className="text-xs opacity-70">
          긍정·부정 변화: {diff.dx > 0 ? "+" : ""}{diff.dx} / 에너지 변화: {diff.dy > 0 ? "+" : ""}{diff.dy}
        </p>
      </div>
    </div>
  );
}

interface CompareViewProps {
  dreamA: Dream;
  dreamB: Dream;
  onClose: () => void;
}

export function CompareView({ dreamA, dreamB, onClose }: CompareViewProps) {
  const diff = getMoodDiff(dreamA, dreamB);

  const renderSide = (dream: Dream, label: string) => (
    <div className="space-y-4">
      <div className="text-center">
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-primary/20 text-primary">{label}</span>
        <p className="text-sm text-muted-foreground mt-2">
          {format(new Date(dream.created_at), "yyyy.M.d", { locale: ko })}
        </p>
      </div>
      <div className="overflow-hidden rounded-xl">
        {dream.analysis ? (
          <AnalysisReport
            summary={dream.analysis.summary}
            dreamType={dream.analysis.dreamType}
            symbols={dream.analysis.symbols}
            emotionConnection={dream.analysis.emotionConnection}
            unconsciousMessage={dream.analysis.unconsciousMessage}
            psychologicalInsight={dream.analysis.psychologicalInsight}
            advice={dream.analysis.advice}
            comfortMessage={dream.analysis.comfortMessage}
          />
        ) : (
          <p className="text-center text-muted-foreground py-10">분석 데이터가 없습니다</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h2 className="font-display text-xl font-bold">나란히 비교</h2>
      </div>

      <MoodDiffBadge diff={diff} />

      {/* Mobile: tabs */}
      <div className="md:hidden">
        <Tabs defaultValue="a">
          <TabsList className="w-full">
            <TabsTrigger value="a" className="flex-1">
              A · {format(new Date(dreamA.created_at), "M/d")}
            </TabsTrigger>
            <TabsTrigger value="b" className="flex-1">
              B · {format(new Date(dreamB.created_at), "M/d")}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="a">{renderSide(dreamA, "A")}</TabsContent>
          <TabsContent value="b">{renderSide(dreamB, "B")}</TabsContent>
        </Tabs>
      </div>

      {/* Desktop: side-by-side */}
      <div className="hidden md:grid md:grid-cols-2 gap-6">
        {renderSide(dreamA, "A")}
        {renderSide(dreamB, "B")}
      </div>
    </div>
  );
}
