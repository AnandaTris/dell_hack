"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  Phone,
  FileText,
  User,
  AlertTriangle,
  DollarSign,
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { t } from "@/lib/i18n";

export function HandoverPanel() {
  const { state, dispatch } = useApp();
  const lang = state.language;
  const brief = state.careBrief;

  if (state.stage === "escalation") {
    return (
      <div className="flex flex-col h-full items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
          <Phone className="w-7 h-7 text-primary-600" />
        </div>
        <h2 className="text-lg font-bold text-stone-900 mb-2">
          Connect with a coordinator
        </h2>
        <p className="text-sm text-stone-500 leading-relaxed mb-6">
          A Care Corner care coordinator will receive Mdm Tan&apos;s full Care
          Brief and reach out to schedule a call. You won&apos;t need to repeat
          anything.
        </p>
        <button
          onClick={() => dispatch({ type: "CONFIRM_HANDOVER" })}
          className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 text-sm"
        >
          Yes, send my Care Brief to a coordinator
        </button>
        <button
          onClick={() => dispatch({ type: "SET_STAGE", stage: "pathway" })}
          className="mt-3 text-sm text-stone-400 hover:text-stone-600 transition-colors"
        >
          Go back to pathway
        </button>
      </div>
    );
  }

  if (!brief) return null;

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Confirmation banner */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-primary-600 text-white px-4 py-4 flex-shrink-0"
      >
        <div className="flex items-center gap-2 mb-1">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-bold">Care Brief sent to coordinator</span>
        </div>
        <p className="text-sm text-primary-100">
          A Care Corner coordinator will call you within 1 working day.
        </p>
      </motion.div>

      <div className="p-4 flex flex-col gap-4">
        {/* Callback scheduled */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-3"
        >
          <Clock className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-900">
              Callback scheduled
            </p>
            <p className="text-xs text-amber-700">Tomorrow, 10:00 – 11:00 AM</p>
          </div>
        </motion.div>

        {/* Brief summary */}
        <Section icon={<FileText className="w-4 h-4" />} title="Care Brief sent">
          <p className="text-sm text-stone-600 leading-relaxed">
            {brief.summary}
          </p>
        </Section>

        {/* Senior details */}
        <Section icon={<User className="w-4 h-4" />} title="Senior">
          <p className="text-sm text-stone-700 font-medium">
            {brief.seniorDetails.name}, {brief.seniorDetails.age}
          </p>
          <p className="text-sm text-stone-500">{brief.seniorDetails.situation}</p>
        </Section>

        {/* Key needs */}
        <Section
          icon={<AlertTriangle className="w-4 h-4" />}
          title={t(lang, "keyNeeds")}
        >
          <ul className="flex flex-col gap-1">
            {brief.keyNeeds.map((need) => (
              <li key={need} className="flex items-start gap-2 text-sm text-stone-600">
                <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-1.5 flex-shrink-0" />
                {need}
              </li>
            ))}
          </ul>
        </Section>

        {/* Financial */}
        {brief.financialConsiderations && (
          <Section
            icon={<DollarSign className="w-4 h-4" />}
            title={t(lang, "financialNote")}
          >
            <p className="text-sm text-stone-600">{brief.financialConsiderations}</p>
          </Section>
        )}

        {/* Helpline */}
        <div className="bg-stone-100 rounded-xl p-3 text-center">
          <p className="text-xs text-stone-500 mb-1">
            Need help now? AIC is available anytime.
          </p>
          <a
            href="tel:18006506060"
            className="text-sm font-bold text-primary-600 hover:text-primary-700 transition-colors"
          >
            1800-650-6060 (toll-free)
          </a>
        </div>
      </div>
    </div>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-stone-100 rounded-xl p-3 bg-white shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-primary-600">{icon}</span>
        <span className="text-xs font-semibold text-stone-700 uppercase tracking-wide">
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}
