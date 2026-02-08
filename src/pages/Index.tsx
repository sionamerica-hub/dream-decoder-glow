import { useState } from "react";
import { Moon, Calendar, TrendingUp, Clock, ChevronRight, Plus, LogOut } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { BottomNav } from "@/components/BottomNav";
import { DreamCalendar } from "@/components/DreamCalendar";
import { MoodSelector } from "@/components/MoodSelector";
import { EventSelector } from "@/components/EventSelector";
import { DreamInput } from "@/components/DreamInput";
import { AnalysisReport } from "@/components/AnalysisReport";
import { SummaryCard } from "@/components/SummaryCard";
import { GlowCard } from "@/components/ui/GlowCard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useDreamAnalysis } from "@/hooks/useDreamAnalysis";
import { useDreams, Dream } from "@/hooks/useDreams";
import { useAuth } from "@/contexts/AuthContext";

type Tab = "home" | "record" | "reports" | "profile";
type RecordStep = "dream" | "events" | "mood" | "analyzing" | "result";

const getMoodEmoji = (moodX: number | null, moodY: number | null): string => {
  if (moodX === null || moodY === null) return "😐";
  if (moodX > 60 && moodY > 60) return "😊";
  if (moodX > 60 && moodY < 40) return "😌";
  if (moodX < 40 && moodY > 60) return "😰";
  if (moodX < 40 && moodY < 40) return "😢";
  return "😐";
};

const getMoodLabel = (moodX: number | null, moodY: number | null): string => {
  if (moodX === null || moodY === null) return "중립";
  if (moodX > 60 && moodY > 60) return "흥분됨";
  if (moodX > 60 && moodY < 40) return "평온함";
  if (moodX < 40 && moodY > 60) return "불안함";
  if (moodX < 40 && moodY < 40) return "우울함";
  return "중립";
};

const parseDreamAnalysis = (dream: Dream) => ({
  summary: dream.analysis_summary || "",
  symbols: dream.analysis_symbols ? JSON.parse(dream.analysis_symbols) : [],
  emotionConnection: dream.analysis_emotion || "",
  advice: dream.analysis_advice ? JSON.parse(dream.analysis_advice) : [],
});

const Index = () => {
  const { user, signOut } = useAuth();
  const { dreams, loading: dreamsLoading, saveDream } = useDreams();
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [recordStep, setRecordStep] = useState<RecordStep>("dream");
  const [dreamText, setDreamText] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [moodPosition, setMoodPosition] = useState({ x: 50, y: 50 });
  const [selectedDream, setSelectedDream] = useState<Dream | null>(null);
  
  const { analyzeDream, isLoading: isAnalyzing, result: analysisResult, reset: resetAnalysis } = useDreamAnalysis();

  const handleDreamSubmit = (text: string) => {
    setDreamText(text);
    setRecordStep("events");
  };

  const handleEventsNext = () => {
    setRecordStep("mood");
  };

  const handleMoodNext = async () => {
    setRecordStep("analyzing");
    
    const result = await analyzeDream({
      dreamContent: dreamText,
      events: selectedEvents,
      mood: moodPosition,
    });
    
    if (result) {
      // Save to database
      await saveDream({
        content: dreamText,
        events: selectedEvents,
        mood: moodPosition,
        analysis: result,
      });
      setRecordStep("result");
    } else {
      // On error, go back to dream input
      setRecordStep("dream");
    }
  };

  const resetRecord = () => {
    setRecordStep("dream");
    setDreamText("");
    setSelectedEvents([]);
    setMoodPosition({ x: 50, y: 50 });
    resetAnalysis();
  };

  const handleViewDream = (dream: Dream) => {
    setSelectedDream(dream);
    setActiveTab("reports");
  };

  // Calculate stats
  const thisMonthDreams = dreams.filter((d) => {
    const dreamDate = new Date(d.created_at);
    const now = new Date();
    return (
      dreamDate.getMonth() === now.getMonth() &&
      dreamDate.getFullYear() === now.getFullYear()
    );
  });

  const latestDream = dreams[0];

  const renderHomeTab = () => (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold mb-1">
            안녕하세요 <span className="gradient-text">드리머</span>님
          </h1>
          <p className="text-muted-foreground">오늘의 꿈을 기록해 보세요</p>
        </div>
        <div className="p-3 rounded-2xl glass">
          <Moon className="w-6 h-6 text-primary" />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <SummaryCard
          title="이번 달 기록"
          value={`${thisMonthDreams.length}개`}
          subtitle="꿈"
          icon={Calendar}
          variant="default"
        />
        <SummaryCard
          title="총 기록"
          value={`${dreams.length}개`}
          subtitle="보고서"
          icon={TrendingUp}
          variant="accent"
        />
      </div>

      {/* Latest Dream Preview */}
      {latestDream ? (
        <GlowCard variant="warm" className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(var(--warm-start))] to-[hsl(var(--warm-end))] flex items-center justify-center">
                <span className="text-lg">🌙</span>
              </div>
              <div>
                <h3 className="font-semibold">최근 꿈</h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {format(new Date(latestDream.created_at), "M월 d일 a h:mm", { locale: ko })}
                </p>
              </div>
            </div>
            <span className="text-2xl">
              {getMoodEmoji(latestDream.mood_x, latestDream.mood_y)}
            </span>
          </div>
          <p className="text-foreground/80 line-clamp-2 mb-4">
            {latestDream.content}
          </p>
          <Button 
            variant="ghost" 
            className="w-full justify-between hover:bg-white/5"
            onClick={() => handleViewDream(latestDream)}
          >
            <span>분석 결과 보기</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </GlowCard>
      ) : (
        <GlowCard variant="default" className="p-5 text-center">
          <p className="text-muted-foreground">아직 기록된 꿈이 없어요</p>
          <p className="text-sm text-muted-foreground/70">첫 번째 꿈을 기록해보세요!</p>
        </GlowCard>
      )}

      {/* Calendar */}
      <GlowCard className="p-5">
        <DreamCalendar onDateSelect={(date) => console.log("Selected:", date)} />
      </GlowCard>

      {/* New Dream Button */}
      <Button
        onClick={() => setActiveTab("record")}
        className={cn(
          "w-full py-6 rounded-2xl gap-3",
          "bg-gradient-to-r from-primary via-accent to-secondary",
          "hover:shadow-neon-strong transition-all duration-300",
          "font-display font-semibold text-lg"
        )}
      >
        <Plus className="w-5 h-5" />
        새로운 꿈 기록하기
      </Button>
    </div>
  );

  const renderRecordTab = () => (
    <div className="space-y-6 animate-fade-in">
      {/* Progress Indicator */}
      <div className="flex items-center justify-center gap-2">
        {(["dream", "events", "mood", "result"] as const).map((step, i) => (
          <div
            key={step}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              step === recordStep || 
              (recordStep === "analyzing" && step === "result")
                ? "w-8 bg-gradient-to-r from-primary to-accent"
                : ["dream", "events", "mood", "result"].indexOf(step) < 
                  ["dream", "events", "mood", "analyzing", "result"].indexOf(recordStep)
                  ? "w-4 bg-primary/50"
                  : "w-4 bg-muted"
            )}
          />
        ))}
      </div>

      {recordStep === "dream" && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="font-display text-2xl font-bold mb-2">
              <span className="gradient-text">꿈</span>을 기록하세요
            </h2>
            <p className="text-muted-foreground">
              기억나는 대로 자세히 적어주세요
            </p>
          </div>
          <DreamInput onSubmit={handleDreamSubmit} />
        </div>
      )}

      {recordStep === "events" && (
        <div className="space-y-6">
          <EventSelector 
            selectedEvents={selectedEvents}
            onEventsChange={setSelectedEvents}
          />
          <Button
            onClick={handleEventsNext}
            className={cn(
              "w-full py-6 rounded-2xl",
              "bg-gradient-to-r from-primary to-accent",
              "hover:shadow-neon transition-all"
            )}
          >
            다음 단계
          </Button>
        </div>
      )}

      {recordStep === "mood" && (
        <div className="space-y-8 px-4">
          <MoodSelector 
            onMoodChange={(x, y) => setMoodPosition({ x, y })}
            initialX={moodPosition.x}
            initialY={moodPosition.y}
          />
          <Button
            onClick={handleMoodNext}
            className={cn(
              "w-full py-6 rounded-2xl",
              "bg-gradient-to-r from-primary to-accent",
              "hover:shadow-neon transition-all"
            )}
          >
            분석 시작하기
          </Button>
        </div>
      )}

      {recordStep === "analyzing" && (
        <div className="flex flex-col items-center justify-center py-20 space-y-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent animate-pulse" />
            <div className="absolute inset-0 w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent blur-2xl opacity-50 animate-pulse" />
          </div>
          <div className="text-center">
            <h3 className="font-display text-xl font-semibold mb-2">
              꿈을 분석하고 있습니다
            </h3>
            <p className="text-muted-foreground">
              AI가 당신의 무의식을 탐구하고 있어요...
            </p>
          </div>
        </div>
      )}

      {recordStep === "result" && analysisResult && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="font-display text-2xl font-bold mb-2">
              분석 <span className="gradient-text">완료</span>
            </h2>
            <p className="text-muted-foreground">
              당신의 꿈이 말하는 것들
            </p>
          </div>
          <AnalysisReport 
            summary={analysisResult.summary}
            symbols={analysisResult.symbols}
            emotionConnection={analysisResult.emotionConnection}
            advice={analysisResult.advice}
          />
          <Button
            onClick={resetRecord}
            variant="outline"
            className="w-full py-6 rounded-2xl border-primary/30 hover:bg-primary/10"
          >
            새로운 꿈 기록하기
          </Button>
        </div>
      )}
    </div>
  );

  const renderReportsTab = () => (
    <div className="space-y-6 animate-fade-in">
      {selectedDream ? (
        <>
          <Button
            variant="ghost"
            onClick={() => setSelectedDream(null)}
            className="text-muted-foreground"
          >
            ← 목록으로
          </Button>
          <div className="text-center">
            <h2 className="font-display text-xl font-bold mb-2">
              {format(new Date(selectedDream.created_at), "yyyy년 M월 d일", { locale: ko })}
            </h2>
            <p className="text-muted-foreground text-sm">
              {getMoodLabel(selectedDream.mood_x, selectedDream.mood_y)} {getMoodEmoji(selectedDream.mood_x, selectedDream.mood_y)}
            </p>
          </div>
          <GlowCard className="p-4">
            <p className="text-foreground/90">{selectedDream.content}</p>
          </GlowCard>
          <AnalysisReport {...parseDreamAnalysis(selectedDream)} />
        </>
      ) : (
        <>
          <div className="text-center">
            <h2 className="font-display text-2xl font-bold mb-2">
              분석 <span className="gradient-text">보고서</span>
            </h2>
            <p className="text-muted-foreground">
              지금까지의 꿈 분석 기록
            </p>
          </div>
          
          {dreamsLoading ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">불러오는 중...</p>
            </div>
          ) : dreams.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">아직 기록된 꿈이 없어요</p>
            </div>
          ) : (
            <div className="space-y-4">
              {dreams.map((dream, i) => (
                <GlowCard 
                  key={dream.id} 
                  variant={i === 0 ? "cool" : "default"}
                  className="p-4 cursor-pointer hover:scale-[1.02] transition-transform"
                  onClick={() => setSelectedDream(dream)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-2xl">
                      {getMoodEmoji(dream.mood_x, dream.mood_y)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">
                        {dream.content.slice(0, 30)}...
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>
                          {format(new Date(dream.created_at), "M월 d일", { locale: ko })}
                        </span>
                        <span>•</span>
                        <span>{getMoodLabel(dream.mood_x, dream.mood_y)}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  </div>
                </GlowCard>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );

  const renderProfileTab = () => {
    // Calculate emotion distribution from actual dreams
    const emotionCounts = { peaceful: 0, excited: 0, anxious: 0, sad: 0, neutral: 0 };
    dreams.forEach((d) => {
      const label = getMoodLabel(d.mood_x, d.mood_y);
      if (label === "평온함") emotionCounts.peaceful++;
      else if (label === "흥분됨") emotionCounts.excited++;
      else if (label === "불안함") emotionCounts.anxious++;
      else if (label === "우울함") emotionCounts.sad++;
      else emotionCounts.neutral++;
    });
    const total = dreams.length || 1;

    return (
      <div className="space-y-6 animate-fade-in">
        <div className="text-center pt-8">
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-primary to-accent p-1 mb-4">
            <div className="w-full h-full rounded-full bg-card flex items-center justify-center">
              <span className="text-4xl">🌙</span>
            </div>
          </div>
          <h2 className="font-display text-2xl font-bold">
            {user?.email?.split("@")[0] || "드리머"}
          </h2>
          <p className="text-muted-foreground text-sm">{user?.email}</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 rounded-2xl bg-card/50">
            <div className="font-display text-2xl font-bold gradient-text">
              {dreams.length}
            </div>
            <div className="text-sm text-muted-foreground">총 기록</div>
          </div>
          <div className="text-center p-4 rounded-2xl bg-card/50">
            <div className="font-display text-2xl font-bold gradient-text-warm">
              {thisMonthDreams.length}
            </div>
            <div className="text-sm text-muted-foreground">이번 달</div>
          </div>
          <div className="text-center p-4 rounded-2xl bg-card/50">
            <div className="font-display text-2xl font-bold text-cyan">
              {dreams.filter((d) => d.analysis_summary).length}
            </div>
            <div className="text-sm text-muted-foreground">분석 완료</div>
          </div>
        </div>

        <GlowCard className="p-5">
          <h3 className="font-semibold mb-4">주요 감정 분포</h3>
          <div className="space-y-3">
            {[
              { label: "평온함", percent: Math.round((emotionCounts.peaceful / total) * 100), color: "from-cyan to-blue-500" },
              { label: "흥분됨", percent: Math.round((emotionCounts.excited / total) * 100), color: "from-pink-500 to-rose-500" },
              { label: "불안함", percent: Math.round((emotionCounts.anxious / total) * 100), color: "from-orange-500 to-red-500" },
              { label: "우울함", percent: Math.round((emotionCounts.sad / total) * 100), color: "from-purple-500 to-indigo-500" },
            ].map((item) => (
              <div key={item.label} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{item.label}</span>
                  <span className="text-muted-foreground">{item.percent}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div 
                    className={`h-full rounded-full bg-gradient-to-r ${item.color}`}
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </GlowCard>

        <Button
          onClick={signOut}
          variant="outline"
          className="w-full py-6 rounded-2xl border-destructive/30 hover:bg-destructive/10 text-destructive"
        >
          <LogOut className="w-4 h-4 mr-2" />
          로그아웃
        </Button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-cosmic pb-28">
      <div className="max-w-lg mx-auto px-4 pt-8">
        {activeTab === "home" && renderHomeTab()}
        {activeTab === "record" && renderRecordTab()}
        {activeTab === "reports" && renderReportsTab()}
        {activeTab === "profile" && renderProfileTab()}
      </div>
      
      <BottomNav activeTab={activeTab} onTabChange={(tab) => {
        setActiveTab(tab as Tab);
        if (tab !== "reports") setSelectedDream(null);
      }} />
    </div>
  );
};

export default Index;
