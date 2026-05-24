import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// In dev: __dirname = services/knowledge-service/src → ../../../data/seed/services.json
// In Docker: SERVICES_DATA_PATH env var points to /app/data/seed/services.json
const DEFAULT_DATA_PATH = join(__dirname, "../../../data/seed/services.json");

export interface ServiceRecord {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  description: string;
  eligibility: string;
  costGuide: string;
  howToAccess: string;
  providerType: string;
  transitionRelevance: boolean;
  source: string;
  contactInfo: string;
  keywords: string[];
}

export interface SearchInput {
  recentHospitalDischarge?: boolean;
  primaryDiagnosis?: string;
  mobility?: "independent" | "assisted" | "wheelchair" | "bedbound";
  chronicConditions?: string[];
  adlSupport?: string[];
  livingArrangement?: "alone" | "with_family" | "with_caregiver" | "other";
  hasCaregiver?: boolean;
  caregiverStressLevel?: "low" | "medium" | "high";
  citizenshipStatus?: "citizen" | "pr" | "foreigner";
  estimatedIncome?: "low" | "medium" | "high";
  pioneerGeneration?: boolean;
  urgency?: "routine" | "urgent" | "critical";
}

export interface ScoredService {
  service: ServiceRecord;
  score: number;
  matchReasons: string[];
}

let _services: ServiceRecord[] | null = null;

function loadServices(): ServiceRecord[] {
  if (_services) return _services;
  const dataPath = process.env["SERVICES_DATA_PATH"] ?? DEFAULT_DATA_PATH;
  const raw = readFileSync(dataPath, "utf-8");
  _services = JSON.parse(raw) as ServiceRecord[];
  return _services;
}

export function searchServices(input: SearchInput, maxResults = 10): ScoredService[] {
  const all = loadServices();
  const scored: ScoredService[] = [];

  const hasDementia = input.chronicConditions?.some((c) =>
    c.toLowerCase().includes("dementia")
  );
  const needsHighPhysicalCare =
    input.mobility === "wheelchair" || input.mobility === "bedbound";
  const needsAssistance =
    input.mobility === "assisted" || needsHighPhysicalCare;
  const lowIncome = input.estimatedIncome === "low";
  const isCitizenOrPR =
    input.citizenshipStatus === "citizen" || input.citizenshipStatus === "pr";

  for (const service of all) {
    let score = 0;
    const reasons: string[] = [];

    // === Transition / post-discharge === (highest priority)
    if (input.recentHospitalDischarge && service.transitionRelevance) {
      score += 30;
      reasons.push("recent hospital discharge");
    }

    // === Service-specific matching ===
    switch (service.id) {
      case "home-medical":
        if (input.recentHospitalDischarge) { score += 20; reasons.push("needs post-discharge medical follow-up"); }
        if (input.mobility === "wheelchair" || input.mobility === "bedbound") { score += 15; reasons.push("difficulty travelling to clinic"); }
        break;

      case "home-nursing":
        if (input.recentHospitalDischarge) { score += 25; reasons.push("post-discharge nursing care needed"); }
        if (input.adlSupport?.some(a => a.toLowerCase().includes("wound"))) { score += 15; reasons.push("wound care needed"); }
        break;

      case "home-personal-care":
        if (needsAssistance) { score += 20; reasons.push("needs help with mobility"); }
        if (input.adlSupport && input.adlSupport.length > 0) { score += 15; reasons.push("needs ADL support"); }
        if (input.livingArrangement === "alone") { score += 10; reasons.push("lives alone"); }
        break;

      case "home-therapy":
        if (input.recentHospitalDischarge) { score += 20; reasons.push("rehabilitation after discharge"); }
        if (needsAssistance) { score += 15; reasons.push("needs physical therapy"); }
        if (input.primaryDiagnosis?.toLowerCase().includes("stroke")) { score += 20; reasons.push("stroke rehabilitation"); }
        if (input.primaryDiagnosis?.toLowerCase().includes("fall")) { score += 15; reasons.push("post-fall rehabilitation"); }
        break;

      case "interim-caregiver":
        if (input.recentHospitalDischarge && input.livingArrangement === "alone") {
          score += 35; reasons.push("discharged to live alone — urgent gap");
        }
        if (!input.hasCaregiver && input.recentHospitalDischarge) { score += 20; reasons.push("no caregiver at home post-discharge"); }
        break;

      case "meals-on-wheels":
        if (input.livingArrangement === "alone") { score += 20; reasons.push("lives alone, nutrition support"); }
        if (needsHighPhysicalCare) { score += 15; reasons.push("limited mobility, cannot cook"); }
        break;

      case "senior-care-centre":
        if (needsAssistance && input.mobility !== "bedbound") { score += 15; reasons.push("needs supervised daytime care"); }
        if (input.livingArrangement === "alone" && input.hasCaregiver) { score += 10; reasons.push("daytime respite for caregiver"); }
        break;

      case "day-rehabilitation":
        if (input.recentHospitalDischarge) { score += 20; reasons.push("post-discharge rehabilitation"); }
        if (needsAssistance && input.mobility !== "bedbound") { score += 15; reasons.push("rehabilitation needed"); }
        break;

      case "dementia-day-care":
        if (hasDementia) { score += 40; reasons.push("dementia-specific care"); }
        break;

      case "active-ageing-centre":
        if (input.mobility === "independent") { score += 15; reasons.push("active aging and social support"); }
        if (input.livingArrangement === "alone" && !hasDementia) { score += 10; reasons.push("combats social isolation"); }
        break;

      case "home-caregiving-grant":
        if (input.hasCaregiver && isCitizenOrPR) { score += 20; reasons.push("caregiver support funding"); }
        if (needsAssistance && isCitizenOrPR) { score += 15; reasons.push("functional limitations qualify"); }
        break;

      case "caregivers-training-grant":
        if (input.hasCaregiver) { score += 20; reasons.push("caregiver skill-building"); }
        if (input.caregiverStressLevel === "high" || input.caregiverStressLevel === "medium") {
          score += 15; reasons.push("caregiver showing stress");
        }
        break;

      case "smf":
        if (needsHighPhysicalCare) { score += 20; reasons.push("mobility/assistive equipment needs"); }
        if (input.recentHospitalDischarge && needsAssistance) { score += 10; reasons.push("equipment for safer home environment"); }
        break;

      case "careshield-life":
        if (needsHighPhysicalCare && isCitizenOrPR) { score += 20; reasons.push("severe disability payouts"); }
        break;

      case "medifund":
        if (lowIncome && isCitizenOrPR) { score += 25; reasons.push("income-based financial assistance"); }
        break;

      case "aic-referral":
        // AIC referral is always a helpful first step, especially for complex cases
        if (input.recentHospitalDischarge) { score += 15; reasons.push("coordinate post-discharge services"); }
        if (input.urgency === "urgent" || input.urgency === "critical") { score += 20; reasons.push("urgent coordination needed"); }
        score += 5; // baseline utility
        break;

      case "ccms":
        if (input.chronicConditions && input.chronicConditions.length >= 2) {
          score += 20; reasons.push("multiple chronic conditions need coordination");
        }
        if (input.recentHospitalDischarge) { score += 10; reasons.push("discharge coordination"); }
        break;

      case "care-corner-iccp":
        if (input.recentHospitalDischarge && (input.chronicConditions?.length ?? 0) >= 1) {
          score += 30; reasons.push("complex discharge with chronic conditions");
        }
        if (input.urgency === "urgent" || input.urgency === "critical") { score += 20; reasons.push("integrated care coordination needed"); }
        break;

      case "medical-social-worker":
        if (input.recentHospitalDischarge) { score += 25; reasons.push("hospital discharge planning support"); }
        if (lowIncome && (input.chronicConditions?.length ?? 0) >= 1) { score += 15; reasons.push("financial + care coordination"); }
        break;
    }

    // Keyword matching boost (softer signal)
    const allTerms = [
      ...(input.chronicConditions ?? []),
      input.primaryDiagnosis ?? "",
      ...(input.adlSupport ?? []),
    ].map((t) => t.toLowerCase());

    for (const kw of service.keywords) {
      if (allTerms.some((term) => term.includes(kw.toLowerCase()) || kw.toLowerCase().includes(term))) {
        score += 3;
      }
    }

    if (score > 0) {
      scored.push({ service, score, matchReasons: [...new Set(reasons)] });
    }
  }

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults);
}

export function getAllServices(): ServiceRecord[] {
  return loadServices();
}
