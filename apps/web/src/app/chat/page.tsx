"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Heart,
  PhoneCall,
  ZoomIn,
  ZoomOut,
  Contrast,
  Play,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/contexts/AppContext";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { MessageBubble, TypingIndicator } from "@/components/chat/MessageBubble";
import { ChatInput } from "@/components/chat/ChatInput";
import { ProfilePanel } from "@/components/chat/ProfilePanel";
import { PathwayView } from "@/components/pathway/PathwayView";
import { HandoverPanel } from "@/components/handover/HandoverPanel";
import type { CareProfile, Pathway } from "@/lib/types";
import { MOCK_TURNS } from "@/lib/mock-data";

export default function ChatPage() {
  const { state, dispatch, addUserMessage, addAssistantMessage } = useApp();
  const router = useRouter();
  const lang = state.language;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const demoRef = useRef(false);

  useEffect(() => {
    if (!state.mode) router.replace("/");
  }, [state.mode, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state.messages, isStreaming]);

  const sendMessage = useCallback(
    async (userText: string) => {
      if (isStreaming) return;
      addUserMessage(userText);
      setIsStreaming(true);
      dispatch({ type: "INCREMENT_TURN" });

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ turnNumber: state.turnNumber }),
        });

        const data = (await res.json()) as {
          message: string;
          profileUpdate: Partial<CareProfile>;
          pathway: Pathway | null;
          triggerStage: string | null;
        };

        await new Promise((r) => setTimeout(r, 800));
        addAssistantMessage(data.message, data.profileUpdate);

        if (data.pathway) {
          await new Promise((r) => setTimeout(r, 600));
          dispatch({ type: "SET_PATHWAY", pathway: data.pathway });
        }
      } catch {
        addAssistantMessage(
          "I'm having trouble connecting right now. Please try again in a moment."
        );
      } finally {
        setIsStreaming(false);
      }
    },
    [
      isStreaming,
      state.turnNumber,
      addUserMessage,
      addAssistantMessage,
      dispatch,
    ]
  );

  const runDemo = useCallback(async () => {
    if (demoRef.current || isStreaming) return;
    demoRef.current = true;

    const demoScript = [
      "My mum was just discharged from the hospital after a fall. I don't know where to start — there are so many services out there.",
      "She lives alone. She can walk but needs help and she's quite unsteady.",
      "She has high blood pressure. I'm her daughter and I try to help but I work full-time with two kids.",
      "She's a Singapore Citizen. Our household income is below $1,200 per person per month.",
    ];

    for (let i = 0; i < Math.min(demoScript.length, MOCK_TURNS.length); i++) {
      const msg = demoScript[i];
      if (!msg) break;
      await new Promise((r) => setTimeout(r, i === 0 ? 500 : 1200));
      await sendMessage(msg);
      await new Promise((r) => setTimeout(r, 400));
    }

    demoRef.current = false;
  }, [isStreaming, sendMessage]);

  const rightPanel = () => {
    if (state.stage === "handover") return <HandoverPanel />;
    if (state.stage === "pathway" || state.stage === "escalation")
      return <PathwayView />;
    return (
      <ProfilePanel
        onNavigate={() => dispatch({ type: "SET_STAGE", stage: "pathway" })}
      />
    );
  };

  if (!state.mode) return null;

  return (
    <div className="flex flex-col h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 px-4 py-3 flex items-center justify-between flex-shrink-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/")}
            aria-label="Back to home"
            className="p-1.5 hover:bg-stone-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <ArrowLeft className="w-4 h-4 text-stone-600" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center">
              <Heart className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-stone-900 text-sm">
              CareKaki
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Accessibility controls */}
          <button
            onClick={() => dispatch({ type: "TOGGLE_LARGE_TEXT" })}
            aria-label={
              state.accessibility.largeText
                ? "Decrease text size"
                : "Increase text size"
            }
            aria-pressed={state.accessibility.largeText}
            className={cn(
              "p-1.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs",
              state.accessibility.largeText
                ? "bg-primary-100 text-primary-700"
                : "hover:bg-stone-100 text-stone-500"
            )}
          >
            {state.accessibility.largeText ? (
              <ZoomOut className="w-4 h-4" />
            ) : (
              <ZoomIn className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => dispatch({ type: "TOGGLE_HIGH_CONTRAST" })}
            aria-label="Toggle high contrast"
            aria-pressed={state.accessibility.highContrast}
            className={cn(
              "p-1.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500",
              state.accessibility.highContrast
                ? "bg-primary-100 text-primary-700"
                : "hover:bg-stone-100 text-stone-500"
            )}
          >
            <Contrast className="w-4 h-4" />
          </button>

          {/* Toggle right panel (mobile) */}
          <button
            onClick={() => setShowRightPanel((v) => !v)}
            className="lg:hidden p-1.5 hover:bg-stone-100 rounded-lg transition-colors text-stone-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-label="Toggle profile panel"
          >
            <span className="text-xs font-medium">
              {showRightPanel ? "Hide" : "Profile"}
            </span>
          </button>

          {/* Talk to human */}
          <button
            onClick={() => dispatch({ type: "REQUEST_HANDOVER" })}
            className="flex items-center gap-1.5 bg-primary-50 hover:bg-primary-100 text-primary-700 font-medium text-xs px-3 py-1.5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t(lang, "talkToHuman")}</span>
            <span className="sm:hidden">Human</span>
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Chat area */}
        <div className="flex flex-col flex-1 min-w-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 chat-scroll">
            {state.messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            <AnimatePresence>
              {isStreaming && <TypingIndicator />}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="flex-shrink-0 border-t border-stone-100 bg-white px-4 py-3">
            {/* Demo button */}
            {state.turnNumber === 0 && !isStreaming && (
              <motion.button
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={runDemo}
                className="w-full mb-2.5 flex items-center justify-center gap-2 bg-accent-50 border border-amber-200 hover:bg-amber-100 text-amber-800 text-xs font-medium py-2 px-3 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <Play className="w-3.5 h-3.5" />
                {t(lang, "runDemo")}
              </motion.button>
            )}
            <ChatInput
              onSend={sendMessage}
              disabled={isStreaming || state.stage === "handover"}
            />
          </div>
        </div>

        {/* Right panel */}
        <AnimatePresence>
          {showRightPanel && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="hidden lg:flex flex-col border-l border-stone-200 bg-stone-50 overflow-hidden flex-shrink-0"
              style={{ width: 320 }}
            >
              {rightPanel()}
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
