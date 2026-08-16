"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { ChatWidget } from "./ChatWidget";

export function FloatingChatLauncher() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-5 right-5 z-40 sm:bottom-6 sm:right-6">
      {open ? (
        <div className="w-[92vw] max-w-[360px]">
          <ChatWidget onClose={() => setOpen(false)} />
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 bg-primary text-cream pl-4 pr-5 py-3.5 rounded-full shadow-[var(--shadow)] hover:bg-primary-deep transition-colors"
        >
          <Sparkles size={18} className="text-gold" strokeWidth={1.75} />
          <span className="text-sm font-medium hidden sm:inline">Chat with AI Stylist</span>
        </button>
      )}
    </div>
  );
}
