"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Heart,
  Users,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  MapPin,
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { CareProfile } from "@/lib/types";

const URGENCY_COLORS = {
  routine: "text-stone-500 bg-stone-100",
  urgent: "text-amber-700 bg-amber-50",
  critical: "text-red-700 bg-red-50",
};

function Field({
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
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn(
        "flex flex-col gap-0.5",
        highlight && "bg-amber-50 -mx-2 px-2 py-1 rounded-md"
      )}
    >
      <span className="text-xs text-stone-400 uppercase tracking-wide font-medium">
        {label}
      </span>
      <span className="text-sm font-medium text-stone-800">{value}</span>
    </motion.div>
  );
}

function Section({
  icon,
  title,
  children,
  show,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  show: boolean;
}) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, height: 0, marginBottom: 0 }}
          animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
          exit={{ opacity: 0, height: 0, marginBottom: 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="border border-stone-100 rounded-xl p-3 bg-white shadow-sm">
            <div className="flex items-center gap-2 mb-2.5">
              <span className="text-primary-600">{icon}</span>
              <span className="text-xs font-semibold text-stone-700 uppercase tracking-wide">
                {title}
              </span>
            </div>
            <div className="flex flex-col gap-2">{children}</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function ProfilePanel({
  onNavigate,
}: {
  onNavigate: () => void;
}) {
  const { state, dispatch } = useApp();
  const { profile, stage } = state;
  const lang = state.language;
  const p = profile as Partial<CareProfile>;

  const completeness = p.completeness ?? 0;
  const hasSenior = !!(p.senior?.name || p.senior?.age);
  const hasCareNeeds = !!(
    p.careNeeds?.mobility || p.careNeeds?.recentHospitalDischarge !== undefined
  );
  const hasCaregiver = !!p.caregiverContext;
  const hasFinancial = !!p.financial;
  const hasTransition = !!p.transitionFlags?.careTransitionNeeded;
  const isPathwayReady = completeness >= 70 || stage === "pathway" || stage === "escalation" || stage === "handover";

  return (
    <div className="flex flex-col h-full bg-stone-50 p-4 overflow-y-auto">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
            {t(lang, "profileTitle")}
          </span>
          {completeness >= 90 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-1 text-xs text-primary-600 font-medium"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {t(lang, "profileComplete")}
            </motion.div>
          )}
        </div>

        {/* Completeness bar */}
        <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary-500 rounded-full"
            initial={{ width: "10%" }}
            animate={{ width: `${completeness}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
        <div className="flex justify-between text-xs text-stone-400 mt-1">
          <span>
            {completeness < 40
              ? t(lang, "profileBuilding")
              : completeness < 80
              ? "Getting there..."
              : t(lang, "profileComplete")}
          </span>
          <span className="font-medium text-stone-600">{completeness}%</span>
        </div>
      </div>

      {/* Empty state */}
      {completeness < 20 && (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-8 opacity-50">
          <div className="w-12 h-12 border-2 border-dashed border-stone-300 rounded-full flex items-center justify-center mb-3">
            <User className="w-5 h-5 text-stone-400" />
          </div>
          <p className="text-sm text-stone-400">{t(lang, "profileBuilding")}</p>
          <p className="text-xs text-stone-300 mt-1">
            The profile fills in as we talk
          </p>
        </div>
      )}

      {/* About the person */}
      <Section
        icon={<User className="w-4 h-4" />}
        title={t(lang, "aboutPerson")}
        show={hasSenior}
      >
        {p.senior?.name && <Field label="Name" value={p.senior.name} />}
        {p.senior?.age && (
          <Field label="Age" value={`${p.senior.age} years old`} />
        )}
        {p.senior?.livingArrangement && (
          <Field
            label="Living situation"
            value={
              p.senior.livingArrangement === "alone"
                ? "Lives alone"
                : p.senior.livingArrangement === "with_family"
                ? "With family"
                : p.senior.livingArrangement === "with_caregiver"
                ? "With caregiver"
                : "Other"
            }
            highlight={p.senior.livingArrangement === "alone"}
          />
        )}
        {p.senior?.primaryLanguage && (
          <Field label="Language" value={p.senior.primaryLanguage} />
        )}
      </Section>

      {/* Care needs */}
      <Section
        icon={<Heart className="w-4 h-4" />}
        title={t(lang, "careNeeds")}
        show={hasCareNeeds}
      >
        {p.careNeeds?.recentHospitalDischarge && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-amber-700 bg-amber-50 px-2 py-1.5 rounded-md text-sm font-medium"
          >
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            Recent hospital discharge
          </motion.div>
        )}
        {p.careNeeds?.primaryDiagnosis && (
          <Field label="Reason" value={p.careNeeds.primaryDiagnosis} />
        )}
        {p.careNeeds?.mobility && (
          <Field
            label="Mobility"
            value={
              p.careNeeds.mobility === "independent"
                ? "Independent"
                : p.careNeeds.mobility === "assisted"
                ? "Needs assistance"
                : p.careNeeds.mobility === "wheelchair"
                ? "Wheelchair"
                : "Bedbound"
            }
          />
        )}
        {p.careNeeds?.chronicConditions &&
          p.careNeeds.chronicConditions.length > 0 && (
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
          )}
      </Section>

      {/* Caregiver */}
      <Section
        icon={<Users className="w-4 h-4" />}
        title={t(lang, "caregiverContext")}
        show={hasCaregiver}
      >
        {p.caregiverContext?.caregiverRelationship && (
          <Field
            label="Relationship"
            value={p.caregiverContext.caregiverRelationship}
          />
        )}
        {p.caregiverContext?.caregiverStressLevel && (
          <Field
            label="Caregiver stress"
            value={
              p.caregiverContext.caregiverStressLevel === "high"
                ? "High — may need respite support"
                : p.caregiverContext.caregiverStressLevel === "medium"
                ? "Moderate"
                : "Low"
            }
            highlight={p.caregiverContext.caregiverStressLevel === "high"}
          />
        )}
      </Section>

      {/* Financial */}
      <Section
        icon={<DollarSign className="w-4 h-4" />}
        title={t(lang, "financialInfo")}
        show={hasFinancial}
      >
        {p.financial?.citizenshipStatus && (
          <Field
            label="Status"
            value={
              p.financial.citizenshipStatus === "citizen"
                ? "Singapore Citizen"
                : p.financial.citizenshipStatus === "pr"
                ? "Permanent Resident"
                : "Foreigner"
            }
          />
        )}
        {p.financial?.estimatedIncome && (
          <Field
            label="Income tier"
            value={
              p.financial.estimatedIncome === "low"
                ? "Low (maximum subsidies eligible)"
                : p.financial.estimatedIncome === "medium"
                ? "Medium (partial subsidies)"
                : "Higher income"
            }
            highlight={p.financial.estimatedIncome === "low"}
          />
        )}
        {p.financial?.pioneerGeneration && (
          <span className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-medium">
            Pioneer Generation
          </span>
        )}
      </Section>

      {/* Transition status */}
      <Section
        icon={<AlertTriangle className="w-4 h-4" />}
        title={t(lang, "transitionStatus")}
        show={hasTransition}
      >
        {p.transitionFlags?.urgency && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "flex items-center gap-2 px-2 py-1.5 rounded-md text-sm font-semibold",
              URGENCY_COLORS[p.transitionFlags.urgency]
            )}
          >
            <MapPin className="w-4 h-4 flex-shrink-0" />
            {p.transitionFlags.urgency === "urgent"
              ? "Care transition — urgent"
              : p.transitionFlags.urgency === "critical"
              ? "Critical — immediate action needed"
              : "Routine"}
          </motion.div>
        )}
        {p.transitionFlags?.careTransitionNeeded && (
          <p className="text-xs text-stone-500">
            Coordinated care plan recommended
          </p>
        )}
      </Section>

      {/* Navigate button */}
      <AnimatePresence>
        {isPathwayReady && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-auto pt-2"
          >
            <button
              onClick={onNavigate}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 text-sm"
            >
              {t(lang, "navigateCare")} →
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
