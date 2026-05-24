"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, User, Heart, ClipboardList, MapPin, Phone } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { CareProfile } from "@/lib/types";

const STEPS = [
  {
    id: "understand",
    label: "Getting to Know You",
    desc: "Building your care profile",
    icon: User,
  },
  {
    id: "assess",
    label: "Assessing Care Needs",
    desc: "Understanding your situation",
    icon: Heart,
  },
  {
    id: "plan",
    label: "Planning Your Care",
    desc: "Matching to right services",
    icon: ClipboardList,
  },
  {
    id: "pathway",
    label: "Care Pathway Ready",
    desc: "Your personalised care plan",
    icon: MapPin,
  },
  {
    id: "connect",
    label: "Connecting to Services",
    desc: "Coordinating with care providers",
    icon: Phone,
  },
];

type StepStatus = "complete" | "active" | "pending";

function getStepStatuses(
  completeness: number,
  appStage: string,
  hasPathway: boolean,
  hasCareBrief: boolean
): StepStatus[] {
  const s = (c: boolean, a: boolean): StepStatus =>
    c ? "complete" : a ? "active" : "pending";

  return [
    s(completeness > 20, completeness <= 20),
    s(completeness >= 55, completeness > 20 && completeness < 55),
    s(hasPathway, completeness >= 55 && !hasPathway),
    s(
      appStage === "escalation" || appStage === "handover",
      appStage === "pathway"
    ),
    s(
      appStage === "handover" && hasCareBrief,
      appStage === "escalation" || (appStage === "handover" && !hasCareBrief)
    ),
  ];
}

function StepBadge({ status }: { status: StepStatus }) {
  if (status === "complete")
    return (
      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary-100 text-primary-700">
        Completed
      </span>
    );
  if (status === "active")
    return (
      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-accent-100 text-accent-500">
        In Progress
      </span>
    );
  return (
    <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-400">
      Pending
    </span>
  );
}

export function ProfilePanel({ onNavigate }: { onNavigate: () => void }) {
  const { state, dispatch } = useApp();
  const { profile, stage, pathway, careBrief, language: lang } = state;
  const p = profile as Partial<CareProfile>;
  const completeness = p.completeness ?? 0;
  const statuses = getStepStatuses(completeness, stage, !!pathway, !!careBrief);
  const isPathwayReady =
    completeness >= 70 ||
    stage === "pathway" ||
    stage === "escalation" ||
    stage === "handover";

  const activeStep = statuses.findIndex((s) => s === "active");
  const allComplete = statuses.every((s) => s === "complete");

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ backgroundColor: "#f7f4ef" }}>
      {/* Panel header */}
      <div className="px-5 pt-5 pb-4 border-b border-stone-200 bg-white flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-stone-900 text-base">Care Journey</h2>
            <p className="text-xs text-stone-500 mt-0.5">
              {allComplete
                ? "Your care plan is ready"
                : activeStep >= 0
                ? `Step ${activeStep + 1} of ${STEPS.length}`
                : "Getting started"}
            </p>
          </div>
          {allComplete && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <CheckCircle2 className="w-5 h-5 text-primary-600" />
            </motion.div>
          )}
        </div>

        {/* Progress bar */}
        <div className="mt-3 w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary-500 rounded-full"
            initial={{ width: "4%" }}
            animate={{
              width: `${Math.max(4, (statuses.filter((s) => s === "complete").length / STEPS.length) * 100)}%`,
            }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Journey steps */}
      <div className="px-5 py-5 flex-1">
        <div className="relative">
          {/* Vertical connecting line */}
          <div className="absolute left-[19px] top-6 bottom-6 w-px bg-stone-200" />

          <div className="flex flex-col gap-1">
            {STEPS.map((step, i) => {
              const status = statuses[i];
              const isActive = status === "active";
              const isComplete = status === "complete";
              const Icon = step.icon;

              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.06 }}
                  className={cn(
                    "relative flex items-start gap-3 p-3 rounded-xl transition-all",
                    isActive
                      ? "bg-white shadow-sm border border-primary-100"
                      : "bg-transparent"
                  )}
                >
                  {/* Step circle */}
                  <div
                    className={cn(
                      "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center z-10 transition-all",
                      isComplete
                        ? "bg-primary-600 shadow-sm shadow-primary-200"
                        : isActive
                        ? "bg-primary-50 border-2 border-primary-400"
                        : "bg-white border-2 border-stone-200"
                    )}
                  >
                    {isComplete ? (
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    ) : (
                      <Icon
                        className={cn(
                          "w-4 h-4",
                          isActive ? "text-primary-600" : "text-stone-300"
                        )}
                      />
                    )}
                  </div>

                  {/* Step content */}
                  <div className="flex-1 min-w-0 pt-1.5">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span
                        className={cn(
                          "text-sm font-semibold",
                          isComplete
                            ? "text-stone-700"
                            : isActive
                            ? "text-stone-900"
                            : "text-stone-400"
                        )}
                      >
                        {step.label}
                      </span>
                      <StepBadge status={status} />
                    </div>
                    <p
                      className={cn(
                        "text-xs mt-0.5",
                        isActive ? "text-stone-500" : "text-stone-400"
                      )}
                    >
                      {step.desc}
                    </p>

                    {/* Profile snippet for active step */}
                    {isActive && i === 0 && p.senior?.name && (
                      <div className="mt-2 text-xs bg-primary-50 text-primary-700 px-2.5 py-1.5 rounded-lg font-medium">
                        {p.senior.name}
                        {p.senior.age ? `, ${p.senior.age}y` : ""}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Profile summary cards — shown once data exists */}
        <AnimatePresence>
          {completeness >= 20 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="mt-6 space-y-2"
            >
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider px-1">
                Profile Summary
              </p>

              {p.senior?.name && (
                <SummaryRow label="Name" value={p.senior.name} />
              )}
              {p.senior?.age && (
                <SummaryRow label="Age" value={`${p.senior.age} years old`} />
              )}
              {p.careNeeds?.mobility && (
                <SummaryRow
                  label="Mobility"
                  value={
                    p.careNeeds.mobility === "assisted"
                      ? "Needs assistance"
                      : p.careNeeds.mobility === "independent"
                      ? "Independent"
                      : p.careNeeds.mobility === "wheelchair"
                      ? "Wheelchair"
                      : "Bedbound"
                  }
                />
              )}
              {p.careNeeds?.recentHospitalDischarge && (
                <SummaryRow label="Recent discharge" value="Yes" highlight />
              )}
              {p.financial?.estimatedIncome && (
                <SummaryRow
                  label="Subsidy tier"
                  value={
                    p.financial.estimatedIncome === "low"
                      ? "Maximum subsidies"
                      : p.financial.estimatedIncome === "medium"
                      ? "Partial subsidies"
                      : "Standard"
                  }
                />
              )}
              {p.careNeeds?.chronicConditions &&
                p.careNeeds.chronicConditions.length > 0 && (
                  <div className="bg-white rounded-xl border border-stone-100 px-3 py-2.5">
                    <p className="text-xs text-stone-400 mb-1.5 font-medium">Conditions</p>
                    <div className="flex flex-wrap gap-1.5">
                      {p.careNeeds.chronicConditions.map((c) => (
                        <span
                          key={c}
                          className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigate CTA */}
      <AnimatePresence>
        {isPathwayReady && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="px-5 pb-5 pt-2 flex-shrink-0"
          >
            <button
              onClick={onNavigate}
              className="w-full bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-semibold py-3 px-4 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 text-sm shadow-sm shadow-primary-200"
            >
              {t(lang, "navigateCare")} →
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex items-center justify-between px-3 py-2.5 rounded-xl border",
        highlight
          ? "bg-accent-50 border-accent-100"
          : "bg-white border-stone-100"
      )}
    >
      <span className="text-xs text-stone-400 font-medium">{label}</span>
      <span
        className={cn(
          "text-xs font-semibold",
          highlight ? "text-accent-500" : "text-stone-700"
        )}
      >
        {value}
      </span>
    </motion.div>
  );
}
