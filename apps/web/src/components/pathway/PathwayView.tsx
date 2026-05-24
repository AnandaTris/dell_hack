"use client";

import { motion } from "framer-motion";
import {
  Clock,
  ChevronRight,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Home,
  DollarSign,
  Users,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { t } from "@/lib/i18n";
import { useApp } from "@/contexts/AppContext";
import type { PathwayGroup, PathwayItem } from "@/lib/types";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  "Home-based": <Home className="w-4 h-4" />,
  Financial: <DollarSign className="w-4 h-4" />,
  Coordination: <Users className="w-4 h-4" />,
  "Centre-based": <Activity className="w-4 h-4" />,
};

const URGENCY_CONFIG = {
  immediate: {
    label: "Immediate",
    className: "bg-red-50 text-red-700 border-red-200",
    dot: "bg-red-500",
  },
  short_term: {
    label: "Short-term",
    className: "bg-accent-50 text-accent-500 border-accent-100",
    dot: "bg-accent-400",
  },
  ongoing: {
    label: "Ongoing",
    className: "bg-stone-50 text-stone-500 border-stone-200",
    dot: "bg-stone-400",
  },
};

function PathwayItemCard({ item, index }: { item: PathwayItem; index: number }) {
  const urgency = URGENCY_CONFIG[item.urgency];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.08 }}
      className="bg-white border border-stone-100 rounded-2xl p-4 shadow-sm"
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600 flex-shrink-0">
            {CATEGORY_ICONS[item.category] ?? <Activity className="w-4 h-4" />}
          </div>
          <span className="font-semibold text-stone-900 text-sm leading-tight">
            {item.serviceName}
          </span>
        </div>
        <span
          className={cn(
            "flex-shrink-0 text-xs font-semibold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5",
            urgency.className
          )}
        >
          <span className={cn("w-1.5 h-1.5 rounded-full", urgency.dot)} />
          {urgency.label}
        </span>
      </div>

      {/* Rationale */}
      <div className="flex items-start gap-2 bg-primary-50 rounded-xl p-2.5 mb-3">
        <Lightbulb className="w-3.5 h-3.5 text-primary-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-primary-800 leading-relaxed">{item.rationale}</p>
      </div>

      {/* Tags */}
      {item.profileFactors.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {item.profileFactors.map((f) => (
            <span
              key={f}
              className="text-xs bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full font-medium"
            >
              {f}
            </span>
          ))}
        </div>
      )}

      {/* Next step */}
      <div className="flex items-start gap-2 pt-2.5 border-t border-stone-50">
        <ChevronRight className="w-3.5 h-3.5 text-primary-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-stone-600 leading-relaxed">
          <span className="font-semibold text-stone-700">Next: </span>
          {item.nextStep}
        </p>
      </div>
    </motion.div>
  );
}

function GroupSection({ group, groupIndex }: { group: PathwayGroup; groupIndex: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: groupIndex * 0.1 }}
      className="mb-6"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-7 h-7 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-sm shadow-primary-200">
          {groupIndex + 1}
        </div>
        <div>
          <h3 className="font-semibold text-stone-900 text-sm">{group.groupName}</h3>
          <p className="text-xs text-stone-500 mt-0.5">{group.groupDescription}</p>
        </div>
      </div>
      <div className="flex flex-col gap-3 ml-10">
        {group.items.map((item, i) => (
          <PathwayItemCard key={item.serviceId} item={item} index={i} />
        ))}
      </div>
    </motion.div>
  );
}

export function PathwayView() {
  const { state, dispatch } = useApp();
  const { pathway, profile, language: lang } = state;

  if (!pathway) return null;

  const immediateCount = pathway.groups
    .flatMap((g) => g.items)
    .filter((i) => i.urgency === "immediate").length;

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ backgroundColor: "#f7f4ef" }}>
      {/* Header */}
      <div className="bg-white border-b border-stone-100 px-5 py-4 flex-shrink-0">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 bg-primary-100 rounded-lg flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4 text-primary-600" />
          </div>
          <h2 className="font-bold text-stone-900 text-base">
            {t(lang, "pathwayTitle")}
          </h2>
        </div>
        {profile?.senior?.name && (
          <p className="text-sm text-stone-500 ml-9">
            {t(lang, "pathwayFor")}{" "}
            <span className="font-semibold text-stone-700">{profile.senior.name}</span>
          </p>
        )}
        <p className="text-xs text-stone-400 mt-1 ml-9 leading-relaxed">
          {t(lang, "pathwayDesc")}
        </p>

        {immediateCount > 0 && (
          <div className="mt-3 flex items-center gap-2 bg-accent-50 border border-accent-100 rounded-xl px-3 py-2.5">
            <Clock className="w-4 h-4 text-accent-500 flex-shrink-0" />
            <p className="text-xs text-stone-700">
              <span className="font-semibold">{immediateCount} action{immediateCount > 1 ? "s" : ""}</span>
              {" "}need attention this week
            </p>
          </div>
        )}
      </div>

      {/* Pathway groups */}
      <div className="flex-1 p-5">
        {pathway.groups.map((group, i) => (
          <GroupSection key={group.groupName} group={group} groupIndex={i} />
        ))}

        {/* Escalation */}
        {pathway.escalationRecommended && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-primary-600 rounded-2xl p-5 text-white mb-4 shadow-sm shadow-primary-300"
          >
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-primary-200" />
              <h3 className="font-bold text-base">{t(lang, "escalationTitle")}</h3>
            </div>
            <p className="text-sm text-primary-100 leading-relaxed mb-4">
              {pathway.escalationReason}
            </p>
            <button
              onClick={() => dispatch({ type: "REQUEST_HANDOVER" })}
              className="w-full bg-white text-primary-700 font-semibold py-2.5 px-4 rounded-xl text-sm hover:bg-primary-50 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-600"
            >
              {t(lang, "requestCoordinator")} →
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
