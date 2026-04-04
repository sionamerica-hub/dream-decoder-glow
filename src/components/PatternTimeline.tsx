import { useState, useMemo } from "react";
import { format, subDays } from "date-fns";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Dream } from "@/hooks/useDreams";
import { getMoodTrend, getSymbolFrequency, getDreamTypeDistribution, getDreamsByDateRange } from "@/lib/dreamAnalytics";
import { GlowCard } from "@/components/ui/GlowCard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PERIOD_OPTIONS = [
  { label: "7일", days: 7 },
  { label: "30일", days: 30 },
  { label: "90일", days: 90 },
  { label: "전체", days: 0 },
];

const PIE_COLORS = ["#a855f7", "#6366f1", "#ec4899", "#f97316", "#22d3ee", "#10b981"];

interface PatternTimelineProps {
  dreams: Dream[];
  onDreamClick?: (dream: Dream) => void;
}

export function PatternTimeline({ dreams, onDreamClick }: PatternTimelineProps) {
  const [periodDays, setPeriodDays] = useState(30);

  const filteredDreams = useMemo(() => {
    if (periodDays === 0) return dreams;
    const start = subDays(new Date(), periodDays);
    return getDreamsByDateRange(dreams, start, new Date());
  }, [dreams, periodDays]);

  const moodTrend = useMemo(() => getMoodTrend(filteredDreams), [filteredDreams]);
  const symbolFreq = useMemo(() => getSymbolFrequency(filteredDreams), [filteredDreams]);
  const typeDistribution = useMemo(() => getDreamTypeDistribution(filteredDreams), [filteredDreams]);

  if (dreams.length === 0) {
    return (
      <div className="text-center py-16 space-y-3">
        <p className="text-4xl">🌙</p>
        <p className="text-muted-foreground">아직 기록이 없어요</p>
        <p className="text-sm text-muted-foreground/70">꿈을 기록하면 패턴을 분석할 수 있어요</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Period filter */}
      <div className="flex gap-2">
        {PERIOD_OPTIONS.map((opt) => (
          <Button
            key={opt.days}
            variant="ghost"
            size="sm"
            onClick={() => setPeriodDays(opt.days)}
            className={cn(
              "rounded-full text-xs",
              periodDays === opt.days
                ? "bg-primary/20 text-primary border border-primary/30"
                : "text-muted-foreground"
            )}
          >
            {opt.label}
          </Button>
        ))}
      </div>

      {/* Mood trend line chart */}
      <GlowCard variant="cool" className="p-5">
        <h3 className="font-display font-semibold mb-4">📈 감정 변화 추이</h3>
        {moodTrend.length < 2 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            데이터 포인트가 2개 이상 필요해요 (현재 {moodTrend.length}개)
          </p>
        ) : (
          <div className="h-[200px] md:h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={moodTrend}>
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                    fontSize: 12,
                  }}
                  formatter={(value: number, name: string) => [
                    value,
                    name === "x" ? "긍정↔부정" : "에너지",
                  ]}
                />
                <Line type="monotone" dataKey="x" stroke="#a855f7" strokeWidth={2} dot={{ r: 4 }} name="x" />
                <Line type="monotone" dataKey="y" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} name="y" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </GlowCard>

      {/* Symbol heatmap */}
      {symbolFreq.length > 0 && (
        <GlowCard variant="accent" className="p-5">
          <h3 className="font-display font-semibold mb-4">🔮 반복 상징 빈도</h3>
          <div className="grid grid-cols-2 gap-2">
            {symbolFreq.map((s) => {
              const maxCount = symbolFreq[0].count;
              const opacity = Math.max(0.2, s.count / maxCount);
              return (
                <div
                  key={s.name}
                  className="flex items-center justify-between px-3 py-2 rounded-lg border border-border/20"
                  style={{ backgroundColor: `rgba(168, 85, 247, ${opacity * 0.2})` }}
                >
                  <span className="text-sm truncate max-w-[80px]">{s.name}</span>
                  <span className="text-xs font-bold text-primary">{s.count}회</span>
                </div>
              );
            })}
          </div>
        </GlowCard>
      )}

      {/* Dream type donut chart */}
      {typeDistribution.length > 0 && (
        <GlowCard variant="warm" className="p-5">
          <h3 className="font-display font-semibold mb-4">🎭 꿈 유형 분포</h3>
          <div className="h-[200px] md:h-[280px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typeDistribution}
                  dataKey="count"
                  nameKey="type"
                  cx="50%"
                  cy="50%"
                  innerRadius="40%"
                  outerRadius="70%"
                  label={({ type, count }) => `${type} (${count})`}
                  labelLine={false}
                  fontSize={11}
                >
                  {typeDistribution.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </GlowCard>
      )}
    </div>
  );
}
