"use client";

import { useRouter } from "next/navigation";
import { ChatWidget } from "./ChatWidget";

export function AIPageChat() {
  const router = useRouter();
  return <ChatWidget onClose={() => router.push("/")} />;
}
