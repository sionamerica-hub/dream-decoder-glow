import { format } from "date-fns";
import { Dream } from "@/hooks/useDreams";

export interface MoodPoint {
  date: string;
  x: number;
  y: number;
  id: string;
}

export interface SymbolFrequency {
  name: string;
  count: number;
}

export interface DreamTypeCount {
  type: string;
  count: number;
}

export interface MoodDiff {
  dx: number;
  dy: number;
  sentiment: "improved" | "worsened" | "neutral";
}

/**
 * 꿈 목록에서 감정 좌표 시계열 데이터를 생성합니다.
 * createdAt 기준 오름차순 정렬, 날짜는 MM/dd 포맷.
 */
export function getMoodTrend(dreams: Dream[]): MoodPoint[] {
  return [...dreams]
    .filter((d) => d.mood_x !== null && d.mood_y !== null)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .map((d) => ({
      date: format(new Date(d.created_at), "MM/dd"),
      x: d.mood_x!,
      y: d.mood_y!,
      id: d.id,
    }));
}

/**
 * 꿈 목록에서 상징 빈도를 집계합니다.
 * count 내림차순 정렬, 최대 10개 반환.
 */
export function getSymbolFrequency(dreams: Dream[]): SymbolFrequency[] {
  const freq: Record<string, number> = {};
  dreams.forEach((d) => {
    d.analysis?.symbols?.forEach((s) => {
      freq[s.name] = (freq[s.name] || 0) + 1;
    });
  });
  return Object.entries(freq)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

/**
 * 꿈 유형별 분포를 집계합니다.
 */
export function getDreamTypeDistribution(dreams: Dream[]): DreamTypeCount[] {
  const freq: Record<string, number> = {};
  dreams.forEach((d) => {
    const type = d.analysis?.dreamType?.split(" - ")[0] || "기타";
    freq[type] = (freq[type] || 0) + 1;
  });
  return Object.entries(freq)
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * 두 꿈 간 감정 좌표 변화를 계산합니다.
 * dx > 0이면 긍정 방향, magnitude < 10이면 neutral.
 */
export function getMoodDiff(dreamA: Dream, dreamB: Dream): MoodDiff {
  const dx = (dreamB.mood_x ?? 50) - (dreamA.mood_x ?? 50);
  const dy = (dreamB.mood_y ?? 50) - (dreamA.mood_y ?? 50);
  const magnitude = Math.sqrt(dx * dx + dy * dy);

  let sentiment: MoodDiff["sentiment"] = "neutral";
  if (magnitude >= 10) {
    sentiment = dx > 0 ? "improved" : "worsened";
  }

  return { dx, dy, sentiment };
}

/**
 * 기간별로 꿈을 필터링합니다.
 */
export function getDreamsByDateRange(dreams: Dream[], start: Date, end: Date): Dream[] {
  return dreams.filter((d) => {
    const date = new Date(d.created_at);
    return date >= start && date <= end;
  });
}
