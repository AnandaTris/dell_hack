"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Send, Mic, MicOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { t } from "@/lib/i18n";
import { useApp } from "@/contexts/AppContext";

interface Props {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: Props) {
  const { state } = useApp();
  const lang = state.language;
  const [value, setValue] = useState("");
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  function handleSend() {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleInput() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }

  const toggleVoice = useCallback(() => {
    if (typeof window === "undefined") return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) return;

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SR();
    recognition.lang = lang === "zh" ? "zh-CN" : lang === "ms" ? "ms-MY" : lang === "ta" ? "ta-IN" : "en-SG";
    recognition.continuous = false;
    recognition.interimResults = false;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (e: any) => {
      const transcript = e.results[0]?.[0]?.transcript ?? "";
      setValue((prev) => prev + (prev ? " " : "") + transcript);
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [isListening, lang]);

  return (
    <div className="flex items-end gap-2 bg-white rounded-2xl border border-stone-200 shadow-sm px-3 py-2 focus-within:border-primary-400 focus-within:ring-1 focus-within:ring-primary-300 transition-all">
      {/* Voice button */}
      <button
        onClick={toggleVoice}
        aria-label={t(lang, "voiceInput")}
        className={cn(
          "p-2 rounded-full flex-shrink-0 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500",
          isListening
            ? "bg-red-100 text-red-600 animate-pulse"
            : "text-stone-400 hover:text-primary-600 hover:bg-primary-50"
        )}
        type="button"
      >
        {isListening ? (
          <MicOff className="w-4 h-4" />
        ) : (
          <Mic className="w-4 h-4" />
        )}
      </button>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        placeholder={t(lang, "typeMessage")}
        disabled={disabled}
        rows={1}
        aria-label="Chat message"
        className="flex-1 resize-none outline-none text-sm text-stone-800 placeholder-stone-400 bg-transparent py-1 max-h-30 leading-relaxed disabled:opacity-50"
        style={{ minHeight: "24px" }}
      />

      {/* Send button */}
      <button
        onClick={handleSend}
        disabled={!value.trim() || disabled}
        aria-label={t(lang, "sendMessage")}
        className={cn(
          "p-2 rounded-full flex-shrink-0 transition-all focus:outline-none focus:ring-2 focus:ring-primary-500",
          value.trim() && !disabled
            ? "bg-primary-600 text-white hover:bg-primary-700"
            : "bg-stone-100 text-stone-400 cursor-not-allowed"
        )}
        type="button"
      >
        <Send className="w-4 h-4" />
      </button>
    </div>
  );
}
