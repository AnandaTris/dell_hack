"use client";

import { useRouter } from "next/navigation";
import { ShieldCheck, Heart, Users } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { t, LANGUAGE_LABELS } from "@/lib/i18n";
import type { Language, Mode } from "@/lib/types";
import { cn } from "@/lib/utils";

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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between max-w-4xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <Heart className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-primary-700 text-lg">
            CareKaki
          </span>
        </div>
        <div className="flex items-center gap-1 text-sm text-stone-500">
          <span className="hidden sm:inline">Powered by</span>
          <span className="font-medium text-primary-600">Care Corner</span>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-2xl mx-auto w-full">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-primary-50 border border-primary-100 text-primary-700 text-sm font-medium px-4 py-1.5 rounded-full mb-5">
            <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse-soft" />
            Care Corner ICCP Navigator
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-stone-900 mb-3 leading-tight">
            CareKaki
          </h1>
          <p className="text-xl text-stone-500 leading-relaxed">
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
        <p className="text-base text-stone-600 mb-5 font-medium">
          {t(lang, "modeTitle")}
        </p>
        <div className="grid sm:grid-cols-2 gap-4 w-full">
          <ModeCard
            icon={<Users className="w-8 h-8" />}
            title={t(lang, "modeForSomeone")}
            desc={t(lang, "modeForSomeonDesc")}
            onClick={() => handleModeSelect("caregiver")}
            recommended
          />
          <ModeCard
            icon={<Heart className="w-8 h-8" />}
            title={t(lang, "modeForMyself")}
            desc={t(lang, "modeForMyselfDesc")}
            onClick={() => handleModeSelect("self")}
          />
        </div>

        {/* PDPA note */}
        <div className="mt-8 flex items-start gap-2 text-xs text-stone-400 max-w-sm text-center">
          <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{t(lang, "pdpaNote")}</span>
        </div>
      </main>

      {/* Coordinator link */}
      <div className="text-center pb-6">
        <a
          href="/coordinator"
          className="text-xs text-stone-400 hover:text-primary-600 transition-colors"
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
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  onClick: () => void;
  recommended?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative group p-6 bg-white rounded-2xl border-2 text-left transition-all duration-200",
        "hover:border-primary-400 hover:shadow-lg hover:-translate-y-0.5",
        "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
        recommended ? "border-primary-200" : "border-stone-100"
      )}
    >
      {recommended && (
        <span className="absolute -top-2.5 left-4 text-xs bg-primary-600 text-white px-2.5 py-0.5 rounded-full font-medium">
          Most common
        </span>
      )}
      <div
        className={cn(
          "mb-4 transition-colors",
          recommended
            ? "text-primary-600"
            : "text-stone-400 group-hover:text-primary-500"
        )}
      >
        {icon}
      </div>
      <h2 className="font-semibold text-stone-900 text-base mb-1">{title}</h2>
      <p className="text-sm text-stone-500 leading-relaxed">{desc}</p>
    </button>
  );
}
