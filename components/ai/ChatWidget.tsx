"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Send, Sparkles, X } from "lucide-react";
import type { Product } from "@/lib/types";
import { getProductImage } from "@/lib/product-image";
import { WHATSAPP_NUMBER, whatsappOrderLink } from "@/lib/business-info";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  recommendations?: Product[];
  outOfScope?: boolean;
}

const GREETING: Message = {
  id: "greeting",
  role: "assistant",
  content: "Hello beautiful! ✨ How can I help you today?",
};

export function ChatWidget({ onClose }: { onClose?: () => void }) {
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    const userMessage: Message = { id: crypto.randomUUID(), role: "user", content: trimmed };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setSending(true);

    try {
      const res = await fetch("/api/ai/stylist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages
            .filter((m) => m.id !== "greeting")
            .map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.reply ?? "I couldn't quite catch that — could you rephrase?",
          recommendations: data.recommendations ?? [],
          outOfScope: Boolean(data.outOfScope),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "I'm having trouble connecting right now — please try again in a moment.",
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col h-[min(560px,70vh)] rounded-[var(--radius)] border border-line bg-white shadow-[var(--shadow)] overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 bg-primary-deep text-cream">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-cream/15">
          <Sparkles size={16} className="text-gold" strokeWidth={1.5} />
        </span>
        <div className="flex-1">
          <p className="text-sm font-medium leading-none">Dew AI Stylist</p>
          <p className="text-[11px] text-cream/60 mt-1">Online</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close chat"
            className="p-1.5 rounded-full hover:bg-cream/10 transition-colors"
          >
            <X size={16} strokeWidth={1.75} />
          </button>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-5 space-y-4 bg-cream/40">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className="max-w-[80%]">
              <div
                className={`px-4 py-2.5 text-sm leading-relaxed rounded-2xl ${
                  m.role === "user"
                    ? "bg-primary text-cream rounded-br-sm"
                    : "bg-white border border-line text-ink rounded-bl-sm"
                }`}
              >
                {m.content}
              </div>
              {m.recommendations && m.recommendations.length > 0 && (
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {m.recommendations.map((p) => (
                    <Link
                      key={p.id}
                      href={`/shop/${p.slug}`}
                      className="block rounded-lg overflow-hidden border border-line bg-white hover:border-primary transition-colors"
                    >
                      <div className="relative aspect-square">
                        <Image src={getProductImage(p)} alt={p.name} fill sizes="80px" className="object-cover" />
                      </div>
                      <p className="px-1.5 py-1 text-[10px] text-ink-soft truncate">${p.price}</p>
                    </Link>
                  ))}
                </div>
              )}
              {m.outOfScope && (
                <a
                  href={whatsappOrderLink("Hi! I have a question the AI stylist couldn't help with.")}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-xs text-primary underline underline-offset-2"
                >
                  Chat with our human staff on WhatsApp ({WHATSAPP_NUMBER})
                </a>
              )}
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex justify-start">
            <div className="px-4 py-3 bg-white border border-line rounded-2xl rounded-bl-sm flex gap-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-ink-soft/50 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex items-center gap-2 border-t border-line p-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 text-sm px-3 py-2.5 outline-none bg-transparent text-ink placeholder:text-ink-soft"
        />
        <button
          type="submit"
          disabled={!input.trim() || sending}
          aria-label="Send message"
          className="h-9 w-9 shrink-0 rounded-full bg-primary text-cream flex items-center justify-center disabled:opacity-40 transition-opacity"
        >
          <Send size={14} strokeWidth={1.75} />
        </button>
      </form>
    </div>
  );
}
