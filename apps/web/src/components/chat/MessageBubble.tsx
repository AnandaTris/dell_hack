"use client";

import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/lib/types";
import { motion } from "framer-motion";

function CareKakiAvatar({ size = 8 }: { size?: number }) {
  const px = size * 4;
  return (
    <div
      className="flex-shrink-0 rounded-full flex items-center justify-center shadow-sm"
      style={{
        width: px,
        height: px,
        backgroundColor: "#4a7c50",
      }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" fill="none" style={{ width: px * 0.55, height: px * 0.55 }}>
        <path
          d="M4 19 C4 19 5.5 10 13.5 7 C16.5 5.8 20 6.5 20 6.5 C20 6.5 18.5 15 10.5 17.5 C7.5 18.5 4 19 4 19Z"
          fill="white"
          opacity="0.9"
        />
        <path
          d="M4 19 L10 13"
          stroke="#4a7c50"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

function parseMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br />");
}

export function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn("flex gap-2.5 mb-4", isUser ? "flex-row-reverse" : "")}
    >
      {!isUser && <CareKakiAvatar size={8} />}

      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
          isUser
            ? "bg-primary-600 text-white rounded-tr-sm"
            : "bg-white text-stone-800 rounded-tl-sm shadow-sm border border-stone-100"
        )}
      >
        <div
          dangerouslySetInnerHTML={{ __html: parseMarkdown(message.content) }}
        />
        <div
          className={cn(
            "text-xs mt-1.5",
            isUser ? "text-primary-200" : "text-stone-400"
          )}
        >
          {message.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    </motion.div>
  );
}

export function TypingIndicator() {
  return (
    <div className="flex gap-2.5 mb-4">
      <CareKakiAvatar size={8} />
      <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-stone-100">
        <div className="flex gap-1.5 items-center h-4">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-primary-300 rounded-full"
              animate={{ y: [0, -4, 0] }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.15,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
