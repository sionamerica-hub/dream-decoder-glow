import { useState } from "react";
import { cn } from "@/lib/utils";
import { Briefcase, Users, Wallet, Heart, Star, MoreHorizontal } from "lucide-react";

interface EventCategory {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
}

const CATEGORIES: EventCategory[] = [
  { id: "work", label: "업무/학업", icon: <Briefcase className="w-5 h-5" />, color: "from-blue-500 to-cyan-500" },
  { id: "relationship", label: "대인관계", icon: <Users className="w-5 h-5" />, color: "from-pink-500 to-rose-500" },
  { id: "finance", label: "금전", icon: <Wallet className="w-5 h-5" />, color: "from-green-500 to-emerald-500" },
  { id: "health", label: "건강", icon: <Heart className="w-5 h-5" />, color: "from-red-500 to-orange-500" },
  { id: "growth", label: "자아실현", icon: <Star className="w-5 h-5" />, color: "from-purple-500 to-violet-500" },
  { id: "other", label: "기타", icon: <MoreHorizontal className="w-5 h-5" />, color: "from-gray-500 to-slate-500" },
];

interface EventSelectorProps {
  selectedEvents?: string[];
  onEventsChange?: (events: string[]) => void;
}

export function EventSelector({ selectedEvents = [], onEventsChange }: EventSelectorProps) {
  const [selected, setSelected] = useState<string[]>(selectedEvents);

  const toggleEvent = (id: string) => {
    const newSelected = selected.includes(id)
      ? selected.filter(e => e !== id)
      : [...selected, id];
    setSelected(newSelected);
    onEventsChange?.(newSelected);
  };

  return (
    <div className="w-full">
      <h3 className="text-lg font-display font-semibold text-center mb-6 text-foreground/90">
        최근 겪은 일 또는 고민
      </h3>
      <p className="text-sm text-muted-foreground text-center mb-6">
        여러 개 선택할 수 있습니다
      </p>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {CATEGORIES.map((category) => {
          const isSelected = selected.includes(category.id);
          return (
            <button
              key={category.id}
              onClick={() => toggleEvent(category.id)}
              className={cn(
                "relative p-4 rounded-2xl border transition-all duration-300",
                "flex flex-col items-center gap-3",
                "hover:scale-105",
                isSelected
                  ? `bg-gradient-to-br ${category.color} border-white/20 shadow-neon`
                  : "bg-card/50 border-border/50 hover:border-primary/30 hover:bg-card/80"
              )}
            >
              <div className={cn(
                "p-3 rounded-xl transition-colors",
                isSelected ? "bg-white/20" : "bg-muted"
              )}>
                {category.icon}
              </div>
              <span className={cn(
                "font-medium text-sm",
                isSelected ? "text-white" : "text-foreground/80"
              )}>
                {category.label}
              </span>
              
              {isSelected && (
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-white animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
