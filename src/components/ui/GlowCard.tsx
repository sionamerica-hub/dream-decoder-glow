import { cn } from "@/lib/utils";
import { ReactNode, MouseEventHandler } from "react";

export interface GlowCardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "warm" | "cool" | "accent";
  glow?: boolean;
  hover?: boolean;
  onClick?: MouseEventHandler<HTMLDivElement>;
}

const variantStyles = {
  default: "before:from-primary/20 before:to-transparent",
  warm: "before:from-[hsl(25,90%,55%)]/20 before:via-[hsl(340,75%,55%)]/10 before:to-transparent",
  cool: "before:from-cyan/20 before:via-secondary/10 before:to-transparent",
  accent: "before:from-accent/20 before:to-transparent",
};

export function GlowCard({ 
  children, 
  className, 
  variant = "default",
  glow = false,
  hover = true,
  onClick,
}: GlowCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-2xl bg-card/80 backdrop-blur-xl border border-border/50",
        "before:absolute before:inset-0 before:bg-gradient-to-b before:pointer-events-none",
        variantStyles[variant],
        hover && "transition-all duration-300 hover:border-primary/30 hover:shadow-card-hover hover:-translate-y-1",
        glow && "shadow-neon animate-glow-pulse",
        onClick && "cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}
