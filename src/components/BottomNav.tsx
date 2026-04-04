import { Home, PenLine, BookOpen, GitCompareArrows, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { id: "home", label: "홈", icon: <Home className="w-5 h-5" /> },
  { id: "record", label: "기록", icon: <PenLine className="w-5 h-5" /> },
  { id: "reports", label: "보고서", icon: <BookOpen className="w-5 h-5" /> },
  { id: "compare", label: "비교", icon: <GitCompareArrows className="w-5 h-5" /> },
  { id: "profile", label: "프로필", icon: <User className="w-5 h-5" /> },
];

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div className="mx-4 mb-4">
        <div className="glass-strong rounded-2xl p-2 shadow-card">
          <div className="flex items-center justify-around">
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={cn(
                    "flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-all duration-300",
                    isActive
                      ? "bg-gradient-to-br from-primary to-accent text-white shadow-neon"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  {item.icon}
                  <span className="text-xs font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
