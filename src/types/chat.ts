export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  isStreaming?: boolean;
}

export interface ChatSession {
  dreamId: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface SuggestedQuestion {
  id: string;
  text: string;
  used: boolean;
}
