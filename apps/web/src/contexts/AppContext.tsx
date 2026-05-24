"use client";

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  type ReactNode,
} from "react";
import type {
  AppStage,
  CareProfile,
  CareBrief,
  ChatMessage,
  Language,
  Mode,
  Pathway,
} from "@/lib/types";
import { computeCompleteness, generateId } from "@/lib/utils";
import { createWelcomeMessage, MOCK_CARE_BRIEF } from "@/lib/mock-data";

interface AccessibilityState {
  largeText: boolean;
  highContrast: boolean;
}

interface AppState {
  mode: Mode | null;
  language: Language;
  sessionId: string;
  stage: AppStage;
  messages: ChatMessage[];
  isStreaming: boolean;
  turnNumber: number;
  profile: Partial<CareProfile>;
  pathway: Pathway | null;
  careBrief: CareBrief | null;
  showHandover: boolean;
  accessibility: AccessibilityState;
}

type AppAction =
  | { type: "SET_MODE"; mode: Mode }
  | { type: "SET_LANGUAGE"; language: Language }
  | { type: "START_CHAT" }
  | { type: "ADD_MESSAGE"; message: ChatMessage }
  | { type: "SET_STREAMING"; value: boolean }
  | { type: "UPDATE_PROFILE"; update: Partial<CareProfile> }
  | { type: "SET_PATHWAY"; pathway: Pathway }
  | { type: "SET_STAGE"; stage: AppStage }
  | { type: "REQUEST_HANDOVER" }
  | { type: "CONFIRM_HANDOVER" }
  | { type: "TOGGLE_LARGE_TEXT" }
  | { type: "TOGGLE_HIGH_CONTRAST" }
  | { type: "INCREMENT_TURN" };

function mergeProfile(
  current: Partial<CareProfile>,
  update: Partial<CareProfile>
): Partial<CareProfile> {
  return {
    ...current,
    ...update,
    senior: { ...current.senior, ...update.senior },
    careNeeds: { ...current.careNeeds, ...update.careNeeds },
    caregiverContext: update.caregiverContext
      ? { ...current.caregiverContext, ...update.caregiverContext }
      : current.caregiverContext,
    financial: update.financial
      ? { ...current.financial, ...update.financial }
      : current.financial,
    transitionFlags: update.transitionFlags
      ? { ...current.transitionFlags, ...update.transitionFlags }
      : current.transitionFlags,
  };
}

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_MODE":
      return { ...state, mode: action.mode };

    case "SET_LANGUAGE":
      return { ...state, language: action.language };

    case "START_CHAT": {
      if (!state.mode) return state;
      const welcome = createWelcomeMessage(state.mode);
      const initial: Partial<CareProfile> = {
        mode: state.mode,
        language: state.language,
        digitalReadiness: "medium",
        senior: {},
        careNeeds: {},
        transitionFlags: {
          recentHospitalDischarge: false,
          careTransitionNeeded: false,
        },
      };
      return {
        ...state,
        stage: "chatting",
        messages: [welcome],
        profile: { ...initial, completeness: 10 },
        turnNumber: 0,
      };
    }

    case "ADD_MESSAGE":
      return { ...state, messages: [...state.messages, action.message] };

    case "SET_STREAMING":
      return { ...state, isStreaming: action.value };

    case "UPDATE_PROFILE": {
      const merged = mergeProfile(state.profile, action.update);
      const completeness = computeCompleteness(merged);
      return { ...state, profile: { ...merged, completeness } };
    }

    case "SET_PATHWAY":
      return { ...state, pathway: action.pathway, stage: "pathway" };

    case "SET_STAGE":
      return { ...state, stage: action.stage };

    case "REQUEST_HANDOVER":
      return { ...state, stage: "escalation" };

    case "CONFIRM_HANDOVER":
      return {
        ...state,
        stage: "handover",
        showHandover: true,
        careBrief: MOCK_CARE_BRIEF,
      };

    case "TOGGLE_LARGE_TEXT":
      return {
        ...state,
        accessibility: {
          ...state.accessibility,
          largeText: !state.accessibility.largeText,
        },
      };

    case "TOGGLE_HIGH_CONTRAST":
      return {
        ...state,
        accessibility: {
          ...state.accessibility,
          highContrast: !state.accessibility.highContrast,
        },
      };

    case "INCREMENT_TURN":
      return { ...state, turnNumber: state.turnNumber + 1 };

    default:
      return state;
  }
}

const initialState: AppState = {
  mode: null,
  language: "en",
  sessionId: generateId(),
  stage: "landing",
  messages: [],
  isStreaming: false,
  turnNumber: 0,
  profile: {},
  pathway: null,
  careBrief: null,
  showHandover: false,
  accessibility: { largeText: false, highContrast: false },
};

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  addUserMessage: (content: string) => void;
  addAssistantMessage: (
    content: string,
    profileUpdate?: Partial<CareProfile>
  ) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const addUserMessage = useCallback(
    (content: string) => {
      dispatch({
        type: "ADD_MESSAGE",
        message: {
          id: generateId(),
          role: "user",
          content,
          timestamp: new Date(),
        },
      });
    },
    []
  );

  const addAssistantMessage = useCallback(
    (content: string, profileUpdate?: Partial<CareProfile>) => {
      const msg: ChatMessage = {
        id: generateId(),
        role: "assistant",
        content,
        profileUpdate,
        timestamp: new Date(),
      };
      dispatch({ type: "ADD_MESSAGE", message: msg });
      if (profileUpdate) {
        dispatch({ type: "UPDATE_PROFILE", update: profileUpdate });
      }
    },
    []
  );

  return (
    <AppContext.Provider
      value={{ state, dispatch, addUserMessage, addAssistantMessage }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
