"use client";

import { useRouter } from "next/navigation";
import { ShieldCheck, Users, Heart, Leaf } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { t, LANGUAGE_LABELS } from "@/lib/i18n";
import type { Language, Mode } from "@/lib/types";
import { cn } from "@/lib/utils";

function CareKakiMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 36 36"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <rect width="36" height="36" rx="10" fill="#4a7c50" />
      <path
        d="M9 27 C9 27 11 14 22 9.5 C26.5 7.8 31 9 31 9 C31 9 28.5 21.5 17.5 25 C13 26.5 9 27 9 27Z"
        fill="white"
        opacity="0.9"
      />
      <path
        d="M9 27 L17 19"
        stroke="#4a7c50"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function LandingPage() {
  const { state, dispatch } = useApp();
  const router = useRouter();
  const lang = state.language;

  function handleModeSelect(mode: Mode) {
    dispatch({ type: "SET_MODE", mode });
    dispatch({ type: "START_CHAT" });
    router.push("/chat");
  }

  return (
    <div className="min-h-screen leaf-bg flex flex-col" style={{ backgroundColor: "var(--background)" }}>
      {/* Header */}
      <header className="px-6 py-5 flex items-center justify-between max-w-4xl mx-auto w-full">
        <div className="flex items-center gap-2.5">
          <CareKakiMark className="w-9 h-9" />
          <div>
            <span className="font-bold text-stone-900 text-lg leading-none block">
              CareKaki
            </span>
            <span className="text-xs text-stone-400 leading-none">by Care Corner</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-sm">
          <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse-soft" />
          <span className="text-stone-500 font-medium">ICCP Navigator</span>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-6 max-w-2xl mx-auto w-full">

        {/* Hero */}
        <div className="text-center mb-10 w-full">
          {/* Illustration area */}
          <div className="flex justify-center mb-7">
            <div className="relative">
              <div className="w-24 h-24 rounded-3xl bg-primary-600 flex items-center justify-center shadow-lg shadow-primary-200">
                <CareKakiMark className="w-16 h-16" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-accent-400 rounded-xl flex items-center justify-center shadow-sm">
                <Heart className="w-4 h-4 text-white" fill="white" />
              </div>
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-stone-900 mb-3 tracking-tight">
            Hi, I&apos;m <span className="text-primary-600">CareKaki</span>
          </h1>
          <p className="text-lg text-stone-500 leading-relaxed max-w-sm mx-auto">
            {t(lang, "tagline")}
          </p>
        </div>

        {/* Language selector */}
        <div className="flex gap-2 mb-8 flex-wrap justify-center">
          {(Object.keys(LANGUAGE_LABELS) as Language[]).map((l) => (
            <button
              key={l}
              onClick={() => dispatch({ type: "SET_LANGUAGE", language: l })}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
                l === lang
                  ? "bg-primary-600 text-white shadow-md"
                  : "bg-white text-stone-600 border border-stone-200 hover:border-primary-300 hover:text-primary-700"
              )}
              aria-label={`Switch to ${LANGUAGE_LABELS[l]}`}
              aria-pressed={l === lang}
            >
              {LANGUAGE_LABELS[l]}
            </button>
          ))}
        </div>

        {/* Mode selection */}
        <p className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-4">
          {t(lang, "modeTitle")}
        </p>
        <div className="grid sm:grid-cols-2 gap-4 w-full">
          <ModeCard
            icon={<Users className="w-7 h-7" />}
            title={t(lang, "modeForSomeone")}
            desc={t(lang, "modeForSomeonDesc")}
            onClick={() => handleModeSelect("caregiver")}
            recommended
            color="primary"
          />
          <ModeCard
            icon={<Heart className="w-7 h-7" />}
            title={t(lang, "modeForMyself")}
            desc={t(lang, "modeForMyselfDesc")}
            onClick={() => handleModeSelect("self")}
            color="accent"
          />
        </div>

        {/* PDPA note */}
        <div className="mt-8 flex items-start gap-2 text-xs text-stone-400 max-w-sm text-center">
          <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5 text-primary-400" />
          <span>{t(lang, "pdpaNote")}</span>
        </div>
      </main>

      {/* Footer */}
      <div className="text-center pb-6">
        <a
          href="/coordinator"
          className="text-xs text-stone-400 hover:text-primary-600 transition-colors font-medium"
        >
          Care Corner Coordinator Portal →
        </a>
      </div>
    </div>
  );
}

function ModeCard({
  icon,
  title,
  desc,
  onClick,
  recommended,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  onClick: () => void;
  recommended?: boolean;
  color: "primary" | "accent";
}) {
  const isPrimary = color === "primary";
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative group p-6 bg-white rounded-2xl border-2 text-left transition-all duration-200",
        "hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0",
        "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
        isPrimary ? "border-primary-200 hover:border-primary-400" : "border-stone-100 hover:border-stone-300"
      )}
    >
      {recommended && (
        <span className="absolute -top-2.5 left-5 text-xs bg-primary-600 text-white px-2.5 py-0.5 rounded-full font-semibold tracking-wide">
          Most common
        </span>
      )}
      <div
        className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors",
          isPrimary
            ? "bg-primary-50 text-primary-600 group-hover:bg-primary-100"
            : "bg-stone-50 text-stone-500 group-hover:bg-primary-50 group-hover:text-primary-600"
        )}
      >
        {icon}
      </div>
      <h2 className="font-semibold text-stone-900 text-base mb-1">{title}</h2>
      <p className="text-sm text-stone-500 leading-relaxed">{desc}</p>
      <div
        className={cn(
          "mt-4 text-xs font-semibold flex items-center gap-1 transition-colors",
          isPrimary ? "text-primary-600" : "text-stone-400 group-hover:text-primary-500"
        )}
      >
        Get started →
      </div>
    </button>
  );
}
