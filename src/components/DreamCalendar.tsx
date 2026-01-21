import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface DreamEntry {
  date: string;
  mood: "happy" | "sad" | "anxious" | "calm" | "excited";
  hasEntry: boolean;
}

const MOOD_EMOJIS = {
  happy: "😊",
  sad: "😔",
  anxious: "😰",
  calm: "🧘",
  excited: "🎉",
};

const MOOD_COLORS = {
  happy: "from-yellow-500/30 to-orange-500/30",
  sad: "from-blue-500/30 to-indigo-500/30",
  anxious: "from-red-500/30 to-pink-500/30",
  calm: "from-cyan-500/30 to-teal-500/30",
  excited: "from-pink-500/30 to-purple-500/30",
};

// Sample data
const sampleEntries: DreamEntry[] = [
  { date: "2026-01-05", mood: "calm", hasEntry: true },
  { date: "2026-01-08", mood: "anxious", hasEntry: true },
  { date: "2026-01-12", mood: "happy", hasEntry: true },
  { date: "2026-01-15", mood: "excited", hasEntry: true },
  { date: "2026-01-18", mood: "sad", hasEntry: true },
  { date: "2026-01-20", mood: "calm", hasEntry: true },
];

const DAYS = ["일", "월", "화", "수", "목", "금", "토"];
const MONTHS = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];

export function DreamCalendar({ onDateSelect }: { onDateSelect?: (date: Date) => void }) {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 21));
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  
  const getEntry = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return sampleEntries.find(e => e.date === dateStr);
  };

  const isToday = (day: number) => {
    const today = new Date(2026, 0, 21);
    return today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={prevMonth}
          className="hover:bg-primary/10 hover:text-primary"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        
        <h2 className="font-display font-semibold text-xl">
          {year}년 {MONTHS[month]}
        </h2>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={nextMonth}
          className="hover:bg-primary/10 hover:text-primary"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Day Headers */}
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

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for days before month starts */}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}
        
        {/* Days of the month */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const entry = getEntry(day);
          const today = isToday(day);
          
          return (
            <button
              key={day}
              onClick={() => onDateSelect?.(new Date(year, month, day))}
              className={cn(
                "aspect-square rounded-xl flex flex-col items-center justify-center gap-1",
                "transition-all duration-200 relative group",
                "hover:bg-primary/10 hover:scale-105",
                today && "ring-2 ring-primary ring-offset-2 ring-offset-background",
                entry?.hasEntry && `bg-gradient-to-br ${MOOD_COLORS[entry.mood]}`
              )}
            >
              <span className={cn(
                "text-sm font-medium",
                today && "text-primary font-bold"
              )}>
                {day}
              </span>
              {entry?.hasEntry && (
                <span className="text-base leading-none">
                  {MOOD_EMOJIS[entry.mood]}
                </span>
              )}
              
              {/* Hover tooltip */}
              {entry?.hasEntry && (
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
