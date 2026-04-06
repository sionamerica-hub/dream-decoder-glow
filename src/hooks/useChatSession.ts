import { useState, useEffect, useRef, useCallback } from "react";
import type { ChatMessage, ChatSession } from "@/types/chat";
import type { DreamAnalysis } from "@/hooks/useDreams";

const MAX_TURNS = 20;
const CONTEXT_WINDOW_TURNS = 10;
const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/dream-chat`;

interface UseChatSessionProps {
  dreamId: string;
  dreamContent: string;
  analysis: DreamAnalysis;
}

interface UseChatSessionReturn {
  messages: ChatMessage[];
  isStreaming: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  clearHistory: () => void;
  abortStream: () => void;
}

function loadSession(dreamId: string): ChatMessage[] {
  try {
    const raw = localStorage.getItem(`chat_history_${dreamId}`);
    if (!raw) return [];
    const session: ChatSession = JSON.parse(raw);
    return session.messages.map((m) => ({ ...m, isStreaming: false }));
  } catch {
    return [];
  }
}

function saveSession(dreamId: string, messages: ChatMessage[]) {
  try {
    const clean = messages.filter((m) => !m.isStreaming || m.content.length > 0);
    const session: ChatSession = {
      dreamId,
      messages: clean.map(({ isStreaming, ...rest }) => rest),
      createdAt: clean[0]?.timestamp || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(`chat_history_${dreamId}`, JSON.stringify(session));

    // Update index
    const indexRaw = localStorage.getItem("chat_history_index");
    const index: string[] = indexRaw ? JSON.parse(indexRaw) : [];
    if (!index.includes(dreamId)) {
      index.push(dreamId);
      localStorage.setItem("chat_history_index", JSON.stringify(index));
    }
  } catch {
    // quota exceeded — try cleanup
    cleanupOldHistory();
  }
}

function cleanupOldHistory() {
  try {
    const indexRaw = localStorage.getItem("chat_history_index");
    if (!indexRaw) return;
    const index: string[] = JSON.parse(indexRaw);
    const cutoff = Date.now() - 90 * 24 * 60 * 60 * 1000;
    const kept: string[] = [];
    for (const id of index) {
      const raw = localStorage.getItem(`chat_history_${id}`);
      if (!raw) continue;
      try {
        const session: ChatSession = JSON.parse(raw);
        if (new Date(session.updatedAt).getTime() < cutoff) {
          localStorage.removeItem(`chat_history_${id}`);
          localStorage.removeItem(`chat_suggestions_${id}`);
        } else {
          kept.push(id);
        }
      } catch {
        localStorage.removeItem(`chat_history_${id}`);
      }
    }
    localStorage.setItem("chat_history_index", JSON.stringify(kept));
  } catch {}
}

export function useChatSession({
  dreamId,
  dreamContent,
  analysis,
}: UseChatSessionProps): UseChatSessionReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Load history on mount + cleanup old
  useEffect(() => {
    const saved = loadSession(dreamId);
    setMessages(saved);
    cleanupOldHistory();
  }, [dreamId]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isStreaming) return;
      setError(null);

      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: content.trim(),
        timestamp: new Date().toISOString(),
      };

      const aiMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "",
        timestamp: new Date().toISOString(),
        isStreaming: true,
      };

      setMessages((prev) => {
        let next = [...prev, userMsg, aiMsg];
        // enforce max turns (1 turn = user+assistant pair)
        while (next.length > MAX_TURNS * 2) {
          next = next.slice(2);
        }
        return next;
      });
      setIsStreaming(true);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        // Build context window: last N turns only
        const allPrev = [...messages, userMsg];
        const contextMessages = allPrev.slice(-(CONTEXT_WINDOW_TURNS * 2)).map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const resp = await fetch(CHAT_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: contextMessages,
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
          signal: controller.signal,
        });

        if (!resp.ok || !resp.body) {
          const err = await resp.json().catch(() => ({ error: "Unknown error" }));
          throw new Error(err.error || `Error ${resp.status}`);
        }

        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let fullContent = "";

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
                fullContent += delta;
                const snapshot = fullContent;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === aiMsg.id ? { ...m, content: snapshot } : m
                  )
                );
              }
            } catch {
              // partial JSON, continue
            }
          }
        }

        // Finalize
        setMessages((prev) => {
          const final = prev.map((m) =>
            m.id === aiMsg.id ? { ...m, isStreaming: false, content: fullContent } : m
          );
          saveSession(dreamId, final);
          return final;
        });
      } catch (err) {
        if ((err as Error).name === "AbortError") {
          // Save partial content
          setMessages((prev) => {
            const final = prev.map((m) =>
              m.id === aiMsg.id ? { ...m, isStreaming: false } : m
            );
            saveSession(dreamId, final);
            return final;
          });
        } else {
          console.error("Chat error:", err);
          setError((err as Error).message || "응답 생성 중 오류가 발생했습니다.");
          setMessages((prev) =>
            prev.map((m) =>
              m.id === aiMsg.id
                ? { ...m, isStreaming: false, content: "죄송합니다, 응답을 생성하는 중 오류가 발생했어요. 🙏" }
                : m
            )
          );
        }
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [dreamId, dreamContent, analysis, messages, isStreaming]
  );

  const clearHistory = useCallback(() => {
    setMessages([]);
    localStorage.removeItem(`chat_history_${dreamId}`);
    localStorage.removeItem(`chat_suggestions_${dreamId}`);
  }, [dreamId]);

  const abortStream = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return { messages, isStreaming, error, sendMessage, clearHistory, abortStream };
}
