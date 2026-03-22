import { useState, useRef, useEffect } from "react";
import { Send, MessageCircle, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { GlowCard } from "@/components/ui/GlowCard";
import { cn } from "@/lib/utils";
import type { DreamAnalysis } from "@/hooks/useDreams";

interface DreamChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface DreamChatProps {
  dreamContent: string;
  analysis: DreamAnalysis;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/dream-chat`;

const SUGGESTED_QUESTIONS = [
  "이 꿈에서 반복적으로 나타나는 패턴이 있나요?",
  "이 꿈이 현재 내 삶과 어떤 관련이 있을까요?",
  "꿈에 나온 상징을 더 자세히 알고 싶어요",
  "비슷한 꿈을 다시 꾸면 어떻게 해야 하나요?",
];

export function DreamChat({ dreamContent, analysis }: DreamChatProps) {
  const [messages, setMessages] = useState<DreamChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isStreaming) return;

    const userMsg: DreamChatMessage = { role: "user", content: text.trim() };
    const allMessages = [...messages, userMsg];
    setMessages(allMessages);
    setInput("");
    setIsStreaming(true);

    let assistantContent = "";

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: allMessages.map(m => ({ role: m.role, content: m.content })),
          dreamContext: {
            content: dreamContent,
            summary: analysis.summary,
            dreamType: analysis.dreamType,
            symbols: analysis.symbols,
            emotionConnection: analysis.emotionConnection,
            unconsciousMessage: analysis.unconsciousMessage,
            psychologicalInsight: analysis.psychologicalInsight,
          },
        }),
      });

      if (!resp.ok || !resp.body) {
        const err = await resp.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(err.error || `Error ${resp.status}`);
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIdx: number;
        while ((newlineIdx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIdx);
          buffer = buffer.slice(newlineIdx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              assistantContent += delta;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantContent } : m);
                }
                return [...prev, { role: "assistant", content: assistantContent }];
              });
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch (err) {
      console.error("Dream chat error:", err);
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: "죄송합니다, 응답을 생성하는 중 오류가 발생했어요. 잠시 후 다시 시도해주세요. 🙏" },
      ]);
    } finally {
      setIsStreaming(false);
    }
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
        <span className="font-semibold text-foreground/90">이 꿈에 대해 더 질문하기</span>
      </button>
    );
  }

  return (
    <GlowCard variant="cool" className="p-0 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border/30 bg-card/50">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-primary" />
          <span className="font-semibold text-sm">AI 심리상담사와 대화</span>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-xs text-muted-foreground hover:text-foreground">
          접기
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="max-h-80 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground text-center">
              분석 결과에 대해 궁금한 점을 자유롭게 물어보세요 ✨
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {SUGGESTED_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(q)}
                  className="text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary/90 hover:bg-primary/20 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "bg-muted/50 border border-border/30 rounded-bl-md"
              )}
            >
              {msg.role === "assistant" ? (
                <div className="prose prose-sm prose-invert max-w-none [&>p]:my-1.5 [&>ul]:my-1.5">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}

        {isStreaming && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex justify-start">
            <div className="bg-muted/50 border border-border/30 rounded-2xl rounded-bl-md px-4 py-3">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border/30 bg-card/30">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="궁금한 점을 물어보세요..."
            disabled={isStreaming}
            className="flex-1 bg-muted/30 border border-border/30 rounded-xl px-4 py-2.5 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isStreaming}
            className="rounded-xl bg-primary hover:bg-primary/90 flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </GlowCard>
  );
}
