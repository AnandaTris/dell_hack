import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId() {
  return Math.random().toString(36).slice(2, 11);
}

export function computeCompleteness(
  profile: Partial<import("./types").CareProfile>
): number {
  let score = 0;
  const weights = {
    mode: 5,
    language: 5,
    "senior.name": 10,
    "senior.age": 10,
    "senior.livingArrangement": 10,
    "careNeeds.recentHospitalDischarge": 10,
    "careNeeds.mobility": 10,
    "careNeeds.chronicConditions": 10,
    caregiverContext: 10,
    financial: 10,
    transitionFlags: 10,
  };

  if (profile.mode) score += weights.mode;
  if (profile.language) score += weights.language;
  if (profile.senior?.name) score += weights["senior.name"];
  if (profile.senior?.age) score += weights["senior.age"];
  if (profile.senior?.livingArrangement)
    score += weights["senior.livingArrangement"];
  if (profile.careNeeds?.recentHospitalDischarge !== undefined)
    score += weights["careNeeds.recentHospitalDischarge"];
  if (profile.careNeeds?.mobility) score += weights["careNeeds.mobility"];
  if (
    profile.careNeeds?.chronicConditions &&
    profile.careNeeds.chronicConditions.length > 0
  )
    score += weights["careNeeds.chronicConditions"];
  if (profile.caregiverContext) score += weights.caregiverContext;
  if (profile.financial) score += weights.financial;
  if (profile.transitionFlags) score += weights.transitionFlags;

  return Math.min(100, score);
}
