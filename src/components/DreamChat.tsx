import { useState, useRef, useEffect } from "react";
import { Send, MessageCircle, Loader2, RotateCcw, Square, ChevronDown } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { GlowCard } from "@/components/ui/GlowCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useChatSession } from "@/hooks/useChatSession";
import type { DreamAnalysis } from "@/hooks/useDreams";

interface DreamChatProps {
  dreamId: string;
  dreamContent: string;
  analysis: DreamAnalysis;
}

function StreamingDots() {
  return (
    <div className="flex items-center gap-1 px-2 py-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-2 h-2 rounded-full bg-primary/60 animate-bounce"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </div>
  );
}

function buildSuggestedQuestions(analysis: DreamAnalysis): string[] {
  const questions: string[] = [];
  if (analysis.symbols?.length) {
    const sym = analysis.symbols[0];
    questions.push(`꿈에서 "${sym.name}"이(가) 의미하는 것을 더 알고 싶어요`);
  }
  if (analysis.emotionConnection) {
    questions.push("현재 내 감정 상태와 이 꿈의 관계를 더 알고 싶어요");
  }
  if (analysis.unconsciousMessage) {
    questions.push("무의식의 메시지를 일상에서 어떻게 활용할 수 있을까요?");
  }
  if (questions.length < 3) {
    const fallbacks = [
      "이 꿈에서 반복되는 패턴이 있나요?",
      "이 꿈이 현재 내 삶과 어떤 관련이 있을까요?",
      "비슷한 꿈을 다시 꾸면 어떻게 해야 하나요?",
    ];
    for (const f of fallbacks) {
      if (questions.length >= 3) break;
      if (!questions.includes(f)) questions.push(f);
    }
  }
  return questions.slice(0, 3);
}

export function DreamChat({ dreamId, dreamContent, analysis }: DreamChatProps) {
  const { messages, isStreaming, error, sendMessage, clearHistory, abortStream } =
    useChatSession({ dreamId, dreamContent, analysis });

  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [usedQuestions, setUsedQuestions] = useState<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const suggestedQuestions = buildSuggestedQuestions(analysis);

  // Auto-scroll on new messages
  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  }, [messages]);

  // Auto-open if there's existing history
  useEffect(() => {
    if (messages.length > 0 && !isOpen) {
      setIsOpen(true);
    }
  }, [messages.length]);

  const handleSend = () => {
    if (!input.trim() || isStreaming) return;
    sendMessage(input.trim());
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestedClick = (q: string) => {
    setUsedQuestions((prev) => new Set(prev).add(q));
    sendMessage(q);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "w-full p-4 rounded-2xl border border-primary/30",
          "bg-gradient-to-r from-primary/10 to-accent/10",
          "hover:from-primary/20 hover:to-accent/20",
          "transition-all duration-300 flex items-center justify-center gap-3",
          "group"
        )}
      >
        <MessageCircle className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
        <span className="font-semibold text-foreground/90">루시드와 대화하기</span>
      </button>
    );
  }

  const availableQuestions = suggestedQuestions.filter((q) => !usedQuestions.has(q));

  return (
    <GlowCard variant="cool" className="p-0 overflow-hidden transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border/30 bg-card/50">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-primary" />
          <span className="font-semibold text-sm">AI 심리상담사와 대화</span>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button
              onClick={clearHistory}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-muted/30 transition-colors"
              title="새 대화"
            >
              <RotateCcw className="w-3 h-3" />
              새 대화
            </button>
          )}
          <button
            onClick={() => setIsOpen(false)}
            className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted/30 transition-colors"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="max-h-96 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground text-center">
              분석 결과에 대해 궁금한 점을 자유롭게 물어보세요 ✨
            </p>
            {availableQuestions.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center">
                {availableQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestedClick(q)}
                    className="text-xs px-3 py-2 rounded-xl bg-primary/10 text-primary/90 hover:bg-primary/20 transition-colors text-left leading-relaxed border border-primary/15"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}
          >
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                msg.role === "user"
                  ? "bg-primary/30 border border-primary/30 text-foreground rounded-br-md"
                  : "bg-muted/30 border border-border/30 rounded-bl-md"
              )}
            >
              {msg.role === "assistant" ? (
                msg.isStreaming && !msg.content ? (
                  <StreamingDots />
                ) : (
                  <div className="prose prose-sm prose-invert max-w-none [&>p]:my-1.5 [&>ul]:my-1.5 [&>ol]:my-1.5">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                )
              ) : (
                <span className="whitespace-pre-wrap">{msg.content}</span>
              )}
            </div>
          </div>
        ))}

        {/* Suggested questions after first exchange */}
        {messages.length > 0 && !isStreaming && availableQuestions.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center pt-2">
            {availableQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSuggestedClick(q)}
                className="text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary/80 hover:bg-primary/20 transition-colors border border-primary/10"
              >
                {q}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-2 bg-destructive/10 text-destructive text-xs text-center">
          {error}
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t border-border/30 bg-card/30">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2 items-end"
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="궁금한 점을 물어보세요..."
            disabled={isStreaming}
            rows={1}
            className="flex-1 bg-muted/30 border border-border/30 rounded-xl px-4 py-2.5 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none min-h-[40px] max-h-[120px]"
            style={{ height: "40px" }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = "40px";
              target.style.height = Math.min(target.scrollHeight, 120) + "px";
            }}
          />
          {isStreaming ? (
            <Button
              type="button"
              size="icon"
              onClick={abortStream}
              className="rounded-xl bg-destructive/80 hover:bg-destructive flex-shrink-0"
              title="중지"
            >
              <Square className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim()}
              className="rounded-xl bg-primary hover:bg-primary/90 flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          )}
        </form>
        <p className="text-[10px] text-muted-foreground/40 text-center mt-2">
          Shift+Enter로 줄바꿈 · Enter로 전송
        </p>
      </div>
    </GlowCard>
  );
}
