"use client";

import { useState, useEffect } from "react";
import {
  Heart,
  AlertTriangle,
  Clock,
  CheckCircle2,
  User,
  FileText,
  DollarSign,
  Phone,
  MessageSquare,
  ArrowLeft,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { MOCK_CARE_BRIEF } from "@/lib/mock-data";
import type { CareBrief } from "@/lib/types";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<CareBrief["status"], string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  accepted: "bg-blue-50 text-blue-700 border-blue-200",
  in_progress: "bg-primary-50 text-primary-700 border-primary-200",
  resolved: "bg-stone-100 text-stone-600 border-stone-200",
};

const STATUS_LABELS: Record<CareBrief["status"], string> = {
  pending: "Pending",
  accepted: "Accepted",
  in_progress: "In progress",
  resolved: "Resolved",
};

export default function CoordinatorPage() {
  const [cases, setCases] = useState<CareBrief[]>([MOCK_CARE_BRIEF]);
  const [selected, setSelected] = useState<CareBrief | null>(MOCK_CARE_BRIEF);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [callbackConfirmed, setCallbackConfirmed] = useState(false);

  async function fetchCases() {
    try {
      const res = await fetch("/api/cases");
      if (res.ok) {
        const data = (await res.json()) as CareBrief[];
        if (data.length > 0) {
          setCases(data);
          setSelected((prev) => {
            if (!prev) return data[0] ?? null;
            const updated = data.find((c) => c.id === prev.id);
            return updated ?? prev;
          });
        }
      }
    } catch {
      // Keep existing cases
    }
  }

  useEffect(() => {
    fetchCases().finally(() => setIsLoading(false));
    // Poll every 10 seconds for new cases
    const interval = setInterval(() => fetchCases(), 10_000);
    return () => clearInterval(interval);
  }, []);

  async function refresh() {
    setIsRefreshing(true);
    await fetchCases();
    setIsRefreshing(false);
  }

  async function updateStatus(id: string, status: CareBrief["status"]) {
    const patch = { status };
    // Optimistic update
    setCases((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...patch } : c))
    );
    setSelected((prev) => (prev?.id === id ? { ...prev, ...patch } : prev));

    try {
      await fetch(`/api/cases/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
    } catch {
      // Optimistic update already applied
    }
  }

  function handleAccept() {
    if (selected) updateStatus(selected.id, "accepted");
  }

  function handleCallback() {
    if (selected) {
      setCallbackConfirmed(true);
      updateStatus(selected.id, "in_progress");
    }
  }

  const selectedStatus = selected ? (cases.find((c) => c.id === selected.id)?.status ?? selected.status) : "pending";

  return (
    <div className="flex flex-col h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 px-6 py-4 flex items-center gap-4 flex-shrink-0">
        <Link
          href="/"
          className="p-1.5 hover:bg-stone-100 rounded-lg transition-colors"
          aria-label="Back"
        >
          <ArrowLeft className="w-4 h-4 text-stone-600" />
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center">
            <Heart className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <span className="font-bold text-stone-900 text-sm">CareKaki</span>
            <span className="text-stone-400 text-xs ml-1.5">
              Coordinator Portal
            </span>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <button
            onClick={refresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-700 transition-colors focus:outline-none"
            aria-label="Refresh cases"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", isRefreshing && "animate-spin")} />
            Refresh
          </button>
          <span className="text-xs text-stone-500">Care Corner ICCP</span>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Case list */}
        <aside className="w-72 border-r border-stone-200 bg-white flex flex-col flex-shrink-0">
          <div className="px-4 py-3 border-b border-stone-100 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-stone-900 text-sm">
                Incoming cases
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                {isLoading ? "Loading…" : `${cases.filter((c) => c.status === "pending").length} awaiting review`}
              </p>
            </div>
            {isLoading && <Loader2 className="w-4 h-4 text-stone-400 animate-spin" />}
          </div>
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
            {cases.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelected(c)}
                className={cn(
                  "text-left p-3 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-primary-500",
                  selected?.id === c.id
                    ? "border-primary-300 bg-primary-50"
                    : "border-stone-100 bg-white hover:border-stone-200"
                )}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  {c.urgencyLevel === "urgent" || c.urgencyLevel === "critical" ? (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                  ) : null}
                  <span
                    className={cn(
                      "text-xs font-medium px-2 py-0.5 rounded-full border",
                      STATUS_STYLES[c.status]
                    )}
                  >
                    {STATUS_LABELS[c.status]}
                  </span>
                </div>
                <p className="font-semibold text-stone-900 text-sm">
                  {c.seniorDetails.name ?? "Unknown"}
                  {c.seniorDetails.age ? `, ${c.seniorDetails.age}` : ""}
                </p>
                <p className="text-xs text-stone-500 mt-0.5 leading-relaxed line-clamp-2">
                  {c.seniorDetails.situation}
                </p>
                <div className="flex items-center gap-1 mt-2 text-xs text-stone-400">
                  <Clock className="w-3 h-3" />
                  <span>{formatRelativeTime(c.generatedAt)}</span>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* Care brief detail */}
        {selected ? (
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-2xl mx-auto p-6">
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 mb-4"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h1 className="text-xl font-bold text-stone-900">
                      {selected.seniorDetails.name ?? "Senior"}
                    </h1>
                    <p className="text-sm text-stone-500 mt-0.5">
                      {selected.seniorDetails.age
                        ? `${selected.seniorDetails.age} years old · `
                        : ""}
                      {selected.seniorDetails.situation}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    {(selected.urgencyLevel === "urgent" || selected.urgencyLevel === "critical") && (
                      <span className="flex items-center gap-1 text-xs bg-red-50 text-red-700 border border-red-200 px-2.5 py-1 rounded-full font-medium">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        {selected.urgencyLevel === "critical" ? "Critical" : "Urgent"}
                      </span>
                    )}
                    <span
                      className={cn(
                        "text-xs font-medium px-2.5 py-1 rounded-full border",
                        STATUS_STYLES[selectedStatus]
                      )}
                    >
                      {STATUS_LABELS[selectedStatus]}
                    </span>
                  </div>
                </div>

                <div className="bg-stone-50 rounded-xl p-4 mb-4">
                  <p className="text-sm text-stone-700 leading-relaxed">
                    {selected.summary}
                  </p>
                </div>

                {/* Actions */}
                {callbackConfirmed && selectedStatus === "in_progress" ? (
                  <div className="flex items-center gap-2 bg-primary-50 border border-primary-200 rounded-xl p-3">
                    <CheckCircle2 className="w-5 h-5 text-primary-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-primary-800">
                        Callback confirmed
                      </p>
                      <p className="text-xs text-primary-600">
                        Tomorrow, 10:00 – 11:00 AM · Family notified
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <button
                      onClick={handleAccept}
                      disabled={selectedStatus !== "pending"}
                      className={cn(
                        "flex-1 font-semibold py-2.5 px-4 rounded-xl text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500",
                        selectedStatus === "pending"
                          ? "bg-primary-600 hover:bg-primary-700 text-white"
                          : "bg-stone-100 text-stone-400 cursor-not-allowed"
                      )}
                    >
                      {selectedStatus === "pending" ? "Accept case" : "Accepted ✓"}
                    </button>
                    <button
                      onClick={handleCallback}
                      disabled={selectedStatus === "pending"}
                      className={cn(
                        "flex-1 font-semibold py-2.5 px-4 rounded-xl text-sm border transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500",
                        selectedStatus !== "pending"
                          ? "border-primary-300 text-primary-700 hover:bg-primary-50"
                          : "border-stone-200 text-stone-400 cursor-not-allowed"
                      )}
                    >
                      Schedule callback
                    </button>
                  </div>
                )}
              </motion.div>

              <div className="grid gap-4">
                <BriefSection icon={<User className="w-4 h-4" />} title="Key needs">
                  <ul className="flex flex-col gap-2">
                    {selected.keyNeeds.map((need) => (
                      <li
                        key={need}
                        className="flex items-start gap-2 text-sm text-stone-700"
                      >
                        <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-1.5 flex-shrink-0" />
                        {need}
                      </li>
                    ))}
                  </ul>
                </BriefSection>

                <BriefSection
                  icon={<FileText className="w-4 h-4" />}
                  title="Recommended services"
                >
                  <div className="flex flex-wrap gap-2">
                    {selected.recommendedServices.map((s) => (
                      <span
                        key={s}
                        className="text-xs bg-primary-50 text-primary-700 border border-primary-100 px-2.5 py-1 rounded-full"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </BriefSection>

                {selected.caregiverInfo && (
                  <BriefSection
                    icon={<Phone className="w-4 h-4" />}
                    title="Caregiver"
                  >
                    <p className="text-sm text-stone-700">{selected.caregiverInfo}</p>
                  </BriefSection>
                )}

                {selected.financialConsiderations && (
                  <BriefSection
                    icon={<DollarSign className="w-4 h-4" />}
                    title="Financial considerations"
                  >
                    <p className="text-sm text-stone-700">
                      {selected.financialConsiderations}
                    </p>
                  </BriefSection>
                )}

                {selected.recentTransition && (
                  <BriefSection
                    icon={<AlertTriangle className="w-4 h-4" />}
                    title="Recent transition"
                  >
                    <p className="text-sm text-stone-700">
                      {selected.recentTransition}
                    </p>
                  </BriefSection>
                )}

                <BriefSection
                  icon={<MessageSquare className="w-4 h-4" />}
                  title="Handover notes"
                >
                  <p className="text-sm text-stone-700 leading-relaxed">
                    {selected.handoverNotes}
                  </p>
                </BriefSection>
              </div>
            </div>
          </main>
        ) : (
          <main className="flex-1 flex items-center justify-center text-stone-400">
            <p className="text-sm">Select a case to view details</p>
          </main>
        )}
      </div>
    </div>
  );
}

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60_000) return "Just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

function BriefSection({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-primary-600">{icon}</span>
        <h3 className="font-semibold text-stone-800 text-sm uppercase tracking-wide">
          {title}
        </h3>
      </div>
      {children}
    </motion.div>
  );
}
