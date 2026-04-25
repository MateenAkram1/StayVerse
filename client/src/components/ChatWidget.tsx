import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAppSelector } from "@/app/hooks";
import { api } from "@/api/client";

type Msg = { role: "user" | "assistant"; content: string };

export function ChatWidget() {
  const token = useAppSelector((s) => s.auth.token);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Hi — I am StayVerse Guide (Gemini). Ask about bookings, the wallet, test payments, or how recommendations work.",
    },
  ]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const send = async () => {
    const text = input.trim();
    if (!text || !token) return;
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const { data } = await api.post<{ success?: boolean; reply: string | null; model?: string; message?: string }>("/ai/chat", {
        messages: next.map((m) => ({ role: m.role, content: m.content })),
      });
      if (data.reply) {
        setMessages([...next, { role: "assistant", content: data.reply }]);
      } else {
        setMessages([...next, { role: "assistant", content: data.message || "No reply" }]);
      }
    } catch (e) {
      const m = (e as { response?: { data?: { message?: string } } }).response?.data?.message;
      setMessages([...next, { role: "assistant", content: m || "Chat failed. Is GEMINI_API_KEY set and valid?" }]);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-4 right-4 z-[90] max-w-sm rounded-2xl border border-white/12 bg-ink-800/90 px-4 py-3 text-xs text-ink-200 shadow-glow-pine backdrop-blur-xl"
      >
        <p className="text-ink-100/90">
          <Link to="/login" className="font-medium text-ember transition hover:text-paper">
            Sign in
          </Link>{" "}
          to use the AI guide.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-[90]">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="mb-2 flex w-[min(100vw-2rem,24rem)] flex-col overflow-hidden rounded-2xl border border-white/12 bg-ink-800/90 shadow-glow backdrop-blur-xl"
          >
            <div className="border-b border-white/10 bg-gradient-to-r from-ember/15 to-pine-600/10 px-4 py-3">
              <p className="text-sm font-medium text-paper">StayVerse Guide</p>
              <p className="text-[0.65rem] uppercase tracking-wider text-ink-200/80">Gemini</p>
            </div>
            <div className="max-h-72 space-y-2.5 overflow-y-auto px-3 py-3 text-sm">
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: m.role === "user" ? 8 : -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`rounded-xl px-3 py-2 text-[0.9rem] leading-relaxed ${
                    m.role === "user" ? "ml-7 bg-gradient-to-br from-ember/30 to-ember/10 text-ink-50" : "mr-6 bg-ink-900/80 text-ink-100"
                  } shadow-sm`}
                >
                  {m.content}
                </motion.div>
              ))}
              {loading && (
                <div className="mr-6 flex items-center gap-1 rounded-xl bg-ink-900/60 px-3 py-2 text-xs text-ink-200/90">
                  <span className="inline-flex gap-0.5">
                    <span className="h-1 w-1 animate-bounce rounded-full bg-ember" style={{ animationDelay: "0ms" }} />
                    <span className="h-1 w-1 animate-bounce rounded-full bg-ember" style={{ animationDelay: "120ms" }} />
                    <span className="h-1 w-1 animate-bounce rounded-full bg-ember" style={{ animationDelay: "240ms" }} />
                  </span>
                  Thinking…
                </div>
              )}
              <div ref={bottomRef} />
            </div>
            <div className="flex gap-2 border-t border-white/10 bg-night/30 p-2">
              <input
                className="input-ctrl !mt-0 min-w-0 flex-1 !py-2 text-sm"
                placeholder="Ask about StayVerse…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && void send()}
              />
              <button type="button" className="btn-primary !shrink-0 !px-3 !py-2 text-xs" onClick={send} disabled={loading}>
                Send
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative grid h-12 w-12 place-items-center rounded-full border border-ember/40 bg-gradient-to-br from-ember to-amber-900/80 text-sm font-bold text-paper shadow-glow"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.96 }}
        aria-label="Open AI guide"
      >
        {open ? "×" : "AI"}
        {!open && (
          <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-pine-400 ring-2 ring-ink" />
        )}
      </motion.button>
    </div>
  );
}
