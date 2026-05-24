import type { ConversationMessage } from "../types.js";

const CRISIS_PATTERNS = [
  "abuse",
  "hit me",
  "hitting",
  "hurt me",
  "scared of",
  "afraid of",
  "suicide",
  "want to die",
  "kill myself",
  "end my life",
  "no reason to live",
  "emergency",
  "call ambulance",
  "unconscious",
  "not breathing",
  "chest pain",
  "stroke",
];

const MEDICAL_ADVICE_PATTERNS = [
  "what medicine",
  "what medication",
  "should i take",
  "what dosage",
  "can i stop",
  "is this normal",
  "what is the diagnosis",
];

export interface GuardianResult {
  safe: boolean;
  requiresEscalation: boolean;
  escalationReason?: string;
  safetyFlag: boolean;
  appendToResponse?: string;
}

export function runGuardian(messages: ConversationMessage[]): GuardianResult {
  const lastUserMsg = messages
    .filter((m) => m.role === "user")
    .at(-1)
    ?.content.toLowerCase() ?? "";

  const isCrisis = CRISIS_PATTERNS.some((p) => lastUserMsg.includes(p));
  const seeksMedicalAdvice = MEDICAL_ADVICE_PATTERNS.some((p) =>
    lastUserMsg.includes(p)
  );

  if (isCrisis) {
    return {
      safe: false,
      requiresEscalation: true,
      escalationReason: "Crisis signals detected in conversation",
      safetyFlag: true,
      appendToResponse:
        "\n\n---\n🆘 **If anyone is in immediate danger, please call 995 (Singapore Emergency Services) immediately.**\n\nFor emotional support:\n- **Samaritans of Singapore**: 1-767 (24/7)\n- **AIC Care Helpline**: 1800-650-6060\n\nA Care Corner coordinator can also speak with you directly — just click \"Talk to a human\" above.",
    };
  }

  if (seeksMedicalAdvice) {
    return {
      safe: true,
      requiresEscalation: false,
      safetyFlag: false,
      appendToResponse:
        "\n\n*Please note: I can help you find the right care services, but I'm not able to provide medical advice. For medical questions, please speak with a doctor or call the AIC helpline at 1800-650-6060.*",
    };
  }

  return { safe: true, requiresEscalation: false, safetyFlag: false };
}
