import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface SummaryCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  variant?: "default" | "warm" | "cool" | "accent";
  className?: string;
}

const variantStyles = {
  default: "from-primary/20 via-primary/5 to-transparent",
  warm: "from-orange-500/20 via-pink-500/10 to-transparent",
  cool: "from-cyan-500/20 via-blue-500/10 to-transparent",
  accent: "from-accent/20 via-accent/5 to-transparent",
};

export function SummaryCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon,
  variant = "default",
  className 
}: SummaryCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl p-5",
        "bg-card/60 backdrop-blur-xl border border-border/50",
        "transition-all duration-300 hover:border-primary/30 hover:shadow-card",
        className
      )}
    >
      {/* Gradient overlay */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br pointer-events-none",
        variantStyles[variant]
      )} />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <span className="text-sm font-medium text-muted-foreground">
            {title}
          </span>
          {Icon && (
            <div className="p-2 rounded-xl bg-muted/50">
              <Icon className="w-4 h-4 text-primary" />
            </div>
          )}
        </div>
        
        <div className="font-display font-bold text-2xl mb-1">
          {value}
        </div>
        
        {subtitle && (
          <span className="text-sm text-muted-foreground">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}
