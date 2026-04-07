import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Sparkles, Send, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/nhs-chat`;

const BabyWithBib = () => (
  <svg viewBox="0 0 120 100" className="w-20 h-16 mx-auto mb-2">
    {/* Head */}
    <circle cx="60" cy="38" r="28" fill="hsl(30 80% 90%)" />
    {/* Hair wisps */}
    <path d="M38 25 Q45 10 60 12 Q75 10 82 25" fill="none" stroke="hsl(30 40% 55%)" strokeWidth="3" strokeLinecap="round" />
    <path d="M42 20 Q48 8 55 10" fill="none" stroke="hsl(30 40% 55%)" strokeWidth="2" strokeLinecap="round" />
    {/* Eyes (sleeping) */}
    <path d="M48 36 Q52 33 56 36" fill="none" stroke="hsl(260 30% 40%)" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M64 36 Q68 33 72 36" fill="none" stroke="hsl(260 30% 40%)" strokeWidth="1.5" strokeLinecap="round" />
    {/* Rosy cheeks */}
    <circle cx="44" cy="42" r="5" fill="hsl(350 60% 85%)" opacity="0.6" />
    <circle cx="76" cy="42" r="5" fill="hsl(350 60% 85%)" opacity="0.6" />
    {/* Smile */}
    <path d="M54 46 Q60 51 66 46" fill="none" stroke="hsl(350 40% 60%)" strokeWidth="1.5" strokeLinecap="round" />
    {/* Bib */}
    <path d="M42 58 Q42 52 50 54 Q60 56 70 54 Q78 52 78 58 Q78 78 60 82 Q42 78 42 58Z" fill="hsl(200 70% 85%)" stroke="hsl(200 50% 75%)" strokeWidth="1" />
    <circle cx="60" cy="68" r="3" fill="hsl(340 60% 80%)" />
    {/* Drool drop */}
    <ellipse cx="65" cy="54" rx="2" ry="3" fill="hsl(200 60% 88%)" opacity="0.7" />
  </svg>
);

const TypingDots = () => (
  <div className="flex items-center gap-1.5 px-4 py-3">
    {[0, 1, 2].map(i => (
      <motion.div
        key={i}
        className="w-2 h-2 rounded-full bg-primary/40"
        animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
        transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
      />
    ))}
  </div>
);

export default function AskAI() {
  const { session } = useAuth();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, 50);
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  const send = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: Msg = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    let assistantSoFar = "";

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Something went wrong" }));
        setMessages(prev => [...prev, { role: "assistant", content: err.error || "Sorry, something went wrong. Please try again." }]);
        setIsLoading(false);
        return;
      }

      if (!resp.body) throw new Error("No stream body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      const upsert = (chunk: string) => {
        assistantSoFar += chunk;
        const content = assistantSoFar;
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant") {
            return prev.map((m, i) => i === prev.length - 1 ? { ...m, content } : m);
          }
          return [...prev, { role: "assistant", content }];
        });
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) upsert(content);
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch (e) {
      console.error("Chat error:", e);
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I couldn't connect. Please try again." }]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const suggestions = [
    "Why is my baby dribbling so much?",
    "When should my baby sleep through?",
    "Is it safe to co-sleep?",
    "When to start solid foods?",
  ];

  return (
    <div className="flex flex-col h-[calc(100dvh-4rem)] px-4 pt-4">
      {/* Header */}
      <div className="text-center mb-3 flex-shrink-0">
        <BabyWithBib />
        <h1 className="font-display text-2xl text-foreground">Ask about your baby</h1>
        <p className="text-xs text-muted-foreground mt-1">NHS-guided answers about sleep, development & health</p>
      </div>

      {/* Chat area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 pb-2 min-h-0">
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2 mt-4"
          >
            <p className="text-xs text-muted-foreground text-center mb-3">Try asking…</p>
            <div className="grid grid-cols-2 gap-2">
              {suggestions.map(s => (
                <button
                  key={s}
                  onClick={() => { setInput(s); inputRef.current?.focus(); }}
                  className="text-left text-xs p-3 rounded-2xl bg-card/80 border border-border/50 text-muted-foreground hover:bg-card hover:text-foreground hover:shadow-sm transition-all duration-200"
                >
                  {s}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-card border border-border/50 shadow-sm rounded-bl-md"
                }`}
              >
                {msg.role === "assistant" ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none [&_p]:my-1 [&_ul]:my-1 [&_li]:my-0.5">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  msg.content
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && messages[messages.length - 1]?.role === "user" && <TypingDots />}
      </div>

      {/* Input */}
      <div className="flex-shrink-0 py-3">
        <div className="flex items-center gap-2 bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl px-3 py-1.5 shadow-sm">
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
            placeholder="Ask about sleep, development, or health…"
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none py-2"
            disabled={isLoading}
          />
          <Button
            size="icon"
            onClick={send}
            disabled={!input.trim() || isLoading}
            className="rounded-xl h-9 w-9 bg-primary hover:bg-primary/90"
          >
            {isLoading ? <Sparkles className="w-4 h-4 animate-pulse" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
