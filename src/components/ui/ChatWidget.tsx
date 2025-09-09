import {useEffect, useMemo, useRef, useState} from "react";
import {motion, AnimatePresence} from "framer-motion";
import {
  Send,
  MessageCircle,
  X,
  Bot,
  User as UserIcon,
  Loader2,
} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";

type RoleMode = "patient" | "doctor";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  ts: number;
};

function useMockResponder(mode: RoleMode) {
  return useMemo(() => {
    return async (prompt: string): Promise<string> => {
      // Simple mocked brain; later wire to real API if available
      await new Promise((r) => setTimeout(r, 800 + Math.random() * 600));
      const prefix = mode === "doctor" ? "DoctorBot" : "PatientBot";
      if (/hello|hi/i.test(prompt))
        return `${prefix}: Hello! How can I help today?`;
      if (/appointment/i.test(prompt))
        return `${prefix}: You can view appointments in the Appointments page.`;
      if (/video|learning/i.test(prompt))
        return `${prefix}: Check the Learning Hub for videos.`;
      return `${prefix}: ${prompt}`;
    };
  }, [mode]);
}

export default function ChatWidget({
  mode,
  embedded = false,
}: {
  mode: RoleMode;
  embedded?: boolean;
}) {
  const [open, setOpen] = useState(embedded ? true : false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const respond = useMockResponder(mode);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({behavior: "smooth"});
  }, [messages, open, thinking]);

  const send = async () => {
    if (!input.trim() || thinking) return;
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      text: input.trim(),
      ts: Date.now(),
    };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setThinking(true);
    try {
      const reply = await respond(userMsg.text);
      const botMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        text: reply,
        ts: Date.now(),
      };
      setMessages((m) => [...m, botMsg]);
    } finally {
      setThinking(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const containerClass = embedded
    ? "relative z-10"
    : "fixed bottom-4 right-4 z-50";
  const panelClass = embedded
    ? "w-full h-[70vh] md:h-[75vh] rounded-xl shadow border bg-white/90 backdrop-blur-sm flex flex-col overflow-hidden"
    : "w-[90vw] max-w-sm h-[70vh] rounded-xl shadow-2xl border bg-white/90 backdrop-blur-sm flex flex-col overflow-hidden";

  return (
    <div className={containerClass}>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="panel"
            initial={{opacity: 0, y: 20, scale: 0.98}}
            animate={{opacity: 1, y: 0, scale: 1}}
            exit={{opacity: 0, y: 20, scale: 0.98}}
            transition={{duration: 0.2}}
            className={panelClass}
          >
            <div className="px-4 py-3 border-b flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex items-center gap-2">
                <Bot className="size-5 text-purple-600" />
                <div className="font-semibold">
                  {mode === "doctor" ? "Doctor Assistant" : "Patient Assistant"}
                </div>
              </div>
              {!embedded && (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setOpen(false)}
                >
                  <X className="size-4" />
                </Button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gradient-to-b from-white to-gray-50">
              {messages.length === 0 && !thinking && (
                <div className="text-center text-sm text-gray-500 mt-8">
                  Start the conversation…
                </div>
              )}
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{opacity: 0, y: 8}}
                  animate={{opacity: 1, y: 0}}
                  className={`flex ${
                    m.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow ${
                      m.role === "user"
                        ? "bg-blue-600 text-white rounded-br-sm"
                        : "bg-gray-100 text-gray-800 rounded-bl-sm"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1 text-[10px] opacity-70">
                      {m.role === "user" ? (
                        <UserIcon className="size-3" />
                      ) : (
                        <Bot className="size-3" />
                      )}
                      <span>
                        {new Date(m.ts).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="whitespace-pre-wrap">{m.text}</div>
                  </div>
                </motion.div>
              ))}
              {thinking && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-700 rounded-2xl rounded-bl-sm px-3 py-2 text-sm shadow inline-flex items-center gap-2">
                    <Loader2 className="size-3 animate-spin" />
                    <span className="inline-flex gap-1">
                      <span className="animate-bounce [animation-delay:-.3s]">
                        .
                      </span>
                      <span className="animate-bounce [animation-delay:-.15s]">
                        .
                      </span>
                      <span className="animate-bounce">.</span>
                    </span>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <div className="p-3 border-t bg-white flex items-center gap-2">
              <Input
                placeholder="Type a message…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
              />
              <Button onClick={send} disabled={thinking}>
                <Send className="size-4 mr-1" />
                Send
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!embedded && (
        <Button
          className="rounded-full shadow-lg"
          size="icon"
          onClick={() => setOpen((v) => !v)}
          aria-label="Open chat"
        >
          {open ? (
            <X className="size-5" />
          ) : (
            <MessageCircle className="size-5" />
          )}
        </Button>
      )}
    </div>
  );
}
