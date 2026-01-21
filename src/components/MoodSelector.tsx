import { useState, useRef, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";

interface MoodSelectorProps {
  onMoodChange?: (x: number, y: number) => void;
  initialX?: number;
  initialY?: number;
}

const MOODS = {
  topLeft: { label: "평온", emoji: "🧘" },
  topRight: { label: "흥분", emoji: "🎉" },
  bottomLeft: { label: "우울", emoji: "😔" },
  bottomRight: { label: "불안", emoji: "😰" },
};

export function MoodSelector({ onMoodChange, initialX = 50, initialY = 50 }: MoodSelectorProps) {
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const getMoodLabel = () => {
    const { x, y } = position;
    if (x < 50 && y < 50) return { ...MOODS.topLeft, intensity: Math.max(50 - x, 50 - y) };
    if (x >= 50 && y < 50) return { ...MOODS.topRight, intensity: Math.max(x - 50, 50 - y) };
    if (x < 50 && y >= 50) return { ...MOODS.bottomLeft, intensity: Math.max(50 - x, y - 50) };
    return { ...MOODS.bottomRight, intensity: Math.max(x - 50, y - 50) };
  };

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100));
    
    setPosition({ x, y });
    onMoodChange?.(x, y);
  }, [onMoodChange]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    handleMove(e.clientX, e.clientY);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) handleMove(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging) {
        const touch = e.touches[0];
        handleMove(touch.clientX, touch.clientY);
      }
    };

    const handleEnd = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleEnd);
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("touchend", handleEnd);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleEnd);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleEnd);
    };
  }, [isDragging, handleMove]);

  const mood = getMoodLabel();

  return (
    <div className="w-full max-w-md mx-auto">
      <h3 className="text-lg font-display font-semibold text-center mb-6 text-foreground/90">
        현재 감정 상태를 선택하세요
      </h3>
      
      <div className="relative">
        {/* Axis Labels */}
        <div className="absolute -left-2 top-1/2 -translate-y-1/2 -translate-x-full text-sm text-muted-foreground font-medium">
          부정적
        </div>
        <div className="absolute -right-2 top-1/2 -translate-y-1/2 translate-x-full text-sm text-muted-foreground font-medium">
          긍정적
        </div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full text-sm text-muted-foreground font-medium pb-2">
          높은 에너지
        </div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full text-sm text-muted-foreground font-medium pt-2">
          낮은 에너지
        </div>

        {/* Mood Pad */}
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          className={cn(
            "relative aspect-square rounded-3xl cursor-crosshair overflow-hidden",
            "mood-gradient border border-border/30",
            "shadow-card transition-shadow duration-300",
            isDragging && "shadow-neon-strong"
          )}
        >
          {/* Grid Lines */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-full h-px bg-border/30" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="h-full w-px bg-border/30" />
          </div>

          {/* Corner Labels */}
          <span className="absolute top-3 left-3 text-xs text-muted-foreground/60">🧘 평온</span>
          <span className="absolute top-3 right-3 text-xs text-muted-foreground/60">🎉 흥분</span>
          <span className="absolute bottom-3 left-3 text-xs text-muted-foreground/60">😔 우울</span>
          <span className="absolute bottom-3 right-3 text-xs text-muted-foreground/60">😰 불안</span>

          {/* Pointer */}
          <div
            className={cn(
              "absolute w-10 h-10 -translate-x-1/2 -translate-y-1/2 rounded-full",
              "bg-gradient-to-br from-primary to-accent",
              "shadow-neon-strong border-2 border-white/30",
              "flex items-center justify-center",
              "transition-transform duration-100",
              isDragging && "scale-110"
            )}
            style={{
              left: `${position.x}%`,
              top: `${position.y}%`,
            }}
          >
            <div className="w-3 h-3 rounded-full bg-white/80" />
          </div>
        </div>
      </div>

      {/* Current Mood Display */}
      <div className="mt-6 text-center">
        <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl glass">
          <span className="text-2xl">{mood.emoji}</span>
          <span className="font-display font-semibold text-lg">{mood.label}</span>
          <span className="text-sm text-muted-foreground">
            ({Math.round(mood.intensity)}% 강도)
          </span>
        </div>
      </div>
    </div>
  );
}
