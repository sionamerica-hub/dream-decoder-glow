import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Send, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface DreamInputProps {
  onSubmit?: (text: string) => void;
  placeholder?: string;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
}

export function DreamInput({ onSubmit, placeholder = "꿈에서 무엇을 보셨나요? 자세히 기록해 주세요..." }: DreamInputProps) {
  const [text, setText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const isListeningRef = useRef(false);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 300)}px`;
    }
  }, [text, interimText]);

  const initRecognition = (): SpeechRecognitionInstance | null => {
    const SpeechRecognitionConstructor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognitionConstructor) {
      toast.error("이 브라우저에서는 음성 인식이 지원되지 않습니다");
      return null;
    }

    const recognition: SpeechRecognitionInstance = new SpeechRecognitionConstructor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "ko-KR";

    recognition.onresult = (event) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        setText(prev => prev + finalTranscript);
        setInterimText("");
      } else {
        setInterimText(interimTranscript);
      }
    };

    recognition.onend = () => {
      if (isListeningRef.current) {
        recognition.start();
      }
    };

    recognition.onerror = (event) => {
      if (event.error === "not-allowed") {
        toast.error("마이크 사용 권한이 필요합니다");
        isListeningRef.current = false;
        setIsListening(false);
      } else if (event.error !== "no-speech") {
        console.error("Speech recognition error:", event.error);
      }
    };

    return recognition;
  };

  const handleStartListening = () => {
    if (!recognitionRef.current) {
      recognitionRef.current = initRecognition();
    }

    if (recognitionRef.current) {
      isListeningRef.current = true;
      setIsListening(true);
      recognitionRef.current.start();
      toast.success("음성 인식을 시작합니다");
    }
  };

  const handleStopListening = () => {
    isListeningRef.current = false;
    setIsListening(false);
    recognitionRef.current?.stop();
    setInterimText("");
    toast.info("음성 인식을 중지했습니다");
  };

  const handleSubmit = () => {
    const finalText = text.trim();
    if (finalText) {
      onSubmit?.(finalText);
      setText("");
    }
  };

  const displayText = text + (interimText ? ` ${interimText}` : "");

  return (
    <div className="w-full">
      <div className="relative">
        <div className={cn(
          "relative rounded-2xl overflow-hidden transition-all duration-300",
          "bg-card/60 backdrop-blur-xl border",
          isListening 
            ? "border-accent shadow-glow-pink" 
            : "border-border/50 focus-within:border-primary/50 focus-within:shadow-neon"
        )}>
          {/* Header */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border/30">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">꿈 기록</span>
            {isListening && (
              <span className="ml-auto flex items-center gap-2 text-sm text-accent">
                <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                음성 인식 중...
              </span>
            )}
          </div>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={displayText}
            onChange={(e) => setText(e.target.value)}
            placeholder={placeholder}
            className={cn(
              "w-full min-h-[150px] px-4 py-4 bg-transparent resize-none",
              "text-foreground placeholder:text-muted-foreground/50",
              "focus:outline-none",
              interimText && "text-muted-foreground"
            )}
          />

          {/* Actions */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-border/30">
            <Button
              variant="ghost"
              size="icon"
              onClick={isListening ? handleStopListening : handleStartListening}
              className={cn(
                "rounded-xl transition-all",
                isListening 
                  ? "bg-accent/20 text-accent hover:bg-accent/30" 
                  : "hover:bg-primary/10 hover:text-primary"
              )}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </Button>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {text.length} 자
              </span>
              <Button
                onClick={handleSubmit}
                disabled={!text.trim()}
                className={cn(
                  "rounded-xl px-6 gap-2",
                  "bg-gradient-to-r from-primary to-accent",
                  "hover:shadow-neon transition-all",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                <Send className="w-4 h-4" />
                분석하기
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
