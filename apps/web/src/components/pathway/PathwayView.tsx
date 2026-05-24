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

const URGENCY_STYLES = {
  immediate: "bg-red-50 text-red-700 border-red-200",
  short_term: "bg-amber-50 text-amber-700 border-amber-200",
  ongoing: "bg-stone-50 text-stone-600 border-stone-200",
};

function PathwayItemCard({ item, index }: { item: PathwayItem; index: number }) {
  const urgencyLabel =
    item.urgency === "immediate"
      ? "Immediate"
      : item.urgency === "short_term"
      ? "Short-term"
      : "Ongoing";

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.08 }}
      className="bg-white border border-stone-100 rounded-xl p-4 shadow-sm"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-stone-400">
            {CATEGORY_ICONS[item.category] ?? (
              <Activity className="w-4 h-4" />
            )}
          </span>
          <span className="font-semibold text-stone-900 text-sm">
            {item.serviceName}
          </span>
        </div>
        <span
          className={cn(
            "flex-shrink-0 text-xs font-medium px-2 py-0.5 rounded-full border",
            URGENCY_STYLES[item.urgency]
          )}
        >
          {urgencyLabel}
        </span>
      </div>

      {/* Rationale */}
      <div className="flex items-start gap-2 bg-primary-50 rounded-lg p-2.5 mb-3">
        <Lightbulb className="w-3.5 h-3.5 text-primary-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-primary-900 leading-relaxed">
          {item.rationale}
        </p>
      </div>

      {/* Profile factors */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {item.profileFactors.map((f) => (
          <span
            key={f}
            className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full"
          >
            {f}
          </span>
        ))}
      </div>

      {/* Next step */}
      <div className="flex items-start gap-2 border-t border-stone-50 pt-2.5">
        <ChevronRight className="w-3.5 h-3.5 text-primary-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-stone-600">
          <span className="font-medium text-stone-700">Next step: </span>
          {item.nextStep}
        </p>
      </div>
    </motion.div>
  );
}

function GroupSection({
  group,
  groupIndex,
}: {
  group: PathwayGroup;
  groupIndex: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: groupIndex * 0.1 }}
      className="mb-6"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
          {groupIndex + 1}
        </div>
        <div>
          <h3 className="font-semibold text-stone-900 text-sm">
            {group.groupName}
          </h3>
          <p className="text-xs text-stone-500">{group.groupDescription}</p>
        </div>
      </div>
      <div className="flex flex-col gap-3 ml-8">
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
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Pathway header */}
      <div className="bg-white border-b border-stone-100 px-4 py-4 flex-shrink-0">
        <div className="flex items-center gap-2 mb-1">
          <CheckCircle2 className="w-5 h-5 text-primary-600" />
          <h2 className="font-bold text-stone-900 text-base">
            {t(lang, "pathwayTitle")}
          </h2>
        </div>
        {profile?.senior?.name && (
          <p className="text-sm text-stone-500">
            {t(lang, "pathwayFor")}{" "}
            <span className="font-medium text-stone-700">
              {profile.senior.name}
            </span>
          </p>
        )}
        <p className="text-xs text-stone-400 mt-1">{t(lang, "pathwayDesc")}</p>

        {immediateCount > 0 && (
          <div className="mt-3 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <p className="text-xs text-amber-800">
              <span className="font-semibold">{immediateCount} action</span>
              {immediateCount > 1 ? "s" : ""} need attention this week
            </p>
          </div>
        )}
      </div>

      {/* Pathway groups */}
      <div className="flex-1 p-4">
        {pathway.groups.map((group, i) => (
          <GroupSection key={group.groupName} group={group} groupIndex={i} />
        ))}

        {/* Escalation banner */}
        {pathway.escalationRecommended && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-5 text-white mb-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-primary-200" />
              <h3 className="font-bold text-base">
                {t(lang, "escalationTitle")}
              </h3>
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
