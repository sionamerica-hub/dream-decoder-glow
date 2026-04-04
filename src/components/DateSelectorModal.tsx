import { useState } from "react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { X } from "lucide-react";
import { Dream } from "@/hooks/useDreams";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DateSelectorModalProps {
  dreams: Dream[];
  onSelect: (dreamA: Dream, dreamB: Dream) => void;
  onClose: () => void;
}

export function DateSelectorModal({ dreams, onSelect, onClose }: DateSelectorModalProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const analyzedDreams = dreams.filter((d) => d.analysis !== null);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  };

  const handleConfirm = () => {
    if (selectedIds.length === 2) {
      const a = analyzedDreams.find((d) => d.id === selectedIds[0])!;
      const b = analyzedDreams.find((d) => d.id === selectedIds[1])!;
      onSelect(a, b);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-background/90 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md mx-4 mb-4 sm:mb-0 glass-strong rounded-2xl p-6 animate-fade-in max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-bold">비교할 꿈 2개 선택</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          분석이 완료된 꿈 중 2개를 선택하세요 ({selectedIds.length}/2)
        </p>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {analyzedDreams.length < 2 ? (
            <div className="text-center py-10 space-y-2">
              <p className="text-3xl">🌙</p>
              <p className="text-muted-foreground text-sm">비교하려면 분석된 꿈이 최소 2개 필요해요</p>
            </div>
          ) : (
            analyzedDreams.map((dream) => {
              const isSelected = selectedIds.includes(dream.id);
              const idx = selectedIds.indexOf(dream.id);
              return (
                <button
                  key={dream.id}
                  onClick={() => toggleSelect(dream.id)}
                  className={cn(
                    "w-full text-left p-4 rounded-xl border transition-all",
                    isSelected
                      ? "border-primary bg-primary/10"
                      : "border-border/30 bg-muted/20 hover:bg-muted/40"
                  )}
                >
                  <div className="flex items-center gap-3">
                    {isSelected && (
                      <span className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                        {idx === 0 ? "A" : "B"}
                      </span>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {dream.analysis?.summary?.slice(0, 40) || dream.content.slice(0, 30)}...
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(dream.created_at), "yyyy년 M월 d일", { locale: ko })}
                        {dream.analysis?.dreamType && ` · ${dream.analysis.dreamType.split(" - ")[0]}`}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        <Button
          onClick={handleConfirm}
          disabled={selectedIds.length !== 2}
          className={cn(
            "w-full mt-4 py-5 rounded-xl",
            "bg-gradient-to-r from-primary to-accent",
            "disabled:opacity-40"
          )}
        >
          비교하기
        </Button>
      </div>
    </div>
  );
}
