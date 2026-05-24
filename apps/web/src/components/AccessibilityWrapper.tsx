"use client";

import { useApp } from "@/contexts/AppContext";
import { cn } from "@/lib/utils";

export function AccessibilityWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { state } = useApp();
  return (
    <div
      className={cn(
        "min-h-screen",
        state.accessibility.largeText && "large-text",
        state.accessibility.highContrast && "high-contrast"
      )}
    >
      {children}
    </div>
  );
}
