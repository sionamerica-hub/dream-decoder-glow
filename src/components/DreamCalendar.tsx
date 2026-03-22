import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Dream } from "@/hooks/useDreams";

const getMoodCategory = (moodX: number | null, moodY: number | null): { emoji: string; color: string } => {
  if (moodX === null || moodY === null) return { emoji: "😐", color: "from-gray-500/30 to-gray-400/30" };
  if (moodX > 60 && moodY > 60) return { emoji: "😊", color: "from-yellow-500/30 to-orange-500/30" };
  if (moodX > 60 && moodY < 40) return { emoji: "🧘", color: "from-cyan-500/30 to-teal-500/30" };
  if (moodX < 40 && moodY > 60) return { emoji: "😰", color: "from-red-500/30 to-pink-500/30" };
  if (moodX < 40 && moodY < 40) return { emoji: "😢", color: "from-blue-500/30 to-indigo-500/30" };
  return { emoji: "😐", color: "from-purple-500/30 to-pink-500/30" };
};

const DAYS = ["일", "월", "화", "수", "목", "금", "토"];
const MONTHS = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];

interface DreamCalendarProps {
  dreams?: Dream[];
  onDateSelect?: (date: Date) => void;
}

export function DreamCalendar({ dreams = [], onDateSelect }: DreamCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getDreamForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return dreams.find(d => d.created_at.startsWith(dateStr));
  };

  const today = new Date();
  const isToday = (day: number) =>
    today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" size="icon" onClick={prevMonth} className="hover:bg-primary/10 hover:text-primary">
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h2 className="font-display font-semibold text-xl">
          {year}년 {MONTHS[month]}
        </h2>
        <Button variant="ghost" size="icon" onClick={nextMonth} className="hover:bg-primary/10 hover:text-primary">
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAYS.map((day, i) => (
          <div
            key={day}
            className={cn(
              "text-center text-sm font-medium py-2",
              i === 0 && "text-red-400",
              i === 6 && "text-blue-400",
              i !== 0 && i !== 6 && "text-muted-foreground"
            )}
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dream = getDreamForDay(day);
          const todayFlag = isToday(day);
          const mood = dream ? getMoodCategory(dream.mood_x, dream.mood_y) : null;

          return (
            <button
              key={day}
              onClick={() => onDateSelect?.(new Date(year, month, day))}
              className={cn(
                "aspect-square rounded-xl flex flex-col items-center justify-center gap-1",
                "transition-all duration-200 relative group",
                "hover:bg-primary/10 hover:scale-105",
                todayFlag && "ring-2 ring-primary ring-offset-2 ring-offset-background",
                mood && `bg-gradient-to-br ${mood.color}`
              )}
            >
              <span className={cn("text-sm font-medium", todayFlag && "text-primary font-bold")}>
                {day}
              </span>
              {mood && <span className="text-base leading-none">{mood.emoji}</span>}
              {dream && (
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 rounded-lg bg-popover text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-lg border border-border z-10">
                  꿈 기록 보기
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
