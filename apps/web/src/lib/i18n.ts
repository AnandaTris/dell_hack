import type { Language } from "./types";

const translations = {
  en: {
    // Landing
    tagline: "Your care buddy that knows where to start.",
    modeTitle: "Who needs help today?",
    modeForMyself: "For myself",
    modeForMyselfDesc: "I'm a senior looking for care support",
    modeForSomeone: "For someone I care for",
    modeForSomeonDesc: "I'm a family member or caregiver",
    languageLabel: "Choose language",
    pdpaNote:
      "Your information is kept private and used only to find suitable care services. We follow PDPA guidelines.",
    getStarted: "Get started",

    // Chat
    chatWelcomeSelf:
      "Hi! I'm CareKaki 👋 I'm here to help you find the right care support — not just a list, but personalised guidance for your situation. Tell me a bit about yourself and what you need.",
    chatWelcomeCaregiver:
      "Hi! I'm CareKaki 👋 I'm here to help you find the right care for your loved one. Tell me about the person you're caring for — who they are and what's been happening recently.",
    profileTitle: "Care Profile",
    profileBuilding: "Building understanding...",
    profileComplete: "Profile complete",
    navigateCare: "View Care Pathway",
    talkToHuman: "Talk to a human",
    typeMessage: "Type your message...",
    voiceInput: "Voice input",
    sendMessage: "Send",
    runDemo: "▶ Run demo (Mdm Tan scenario)",

    // Profile fields
    aboutPerson: "About the person",
    careNeeds: "Care needs",
    caregiverContext: "Caregiver",
    financialInfo: "Financial",
    transitionStatus: "Transition",

    // Pathway
    pathwayTitle: "Personalised Care Pathway",
    pathwayFor: "Personalised for",
    pathwayDesc:
      "These aren't random services — each one is recommended based on your specific profile.",
    urgencyImmediate: "Immediate",
    urgencyShortTerm: "Short-term",
    urgencyOngoing: "Ongoing",
    becauseYou: "Why this for you",
    nextStep: "Next step",
    requestCoordinator: "Connect with Care Corner coordinator",
    escalationTitle: "A coordinator can help",
    escalationNote:
      "Given the number of services needed, a Care Corner care coordinator can manage everything together — so you only need to tell your story once.",

    // Coordinator
    coordinatorTitle: "Coordinator Dashboard",
    coordinatorCases: "Incoming cases",
    careBrief: "Care Brief",
    acceptCase: "Accept case",
    scheduleCallback: "Schedule callback",
    urgentLabel: "Urgent",
    pendingLabel: "Pending",
    acceptedLabel: "Accepted",
    inProgressLabel: "In progress",
    resolvedLabel: "Resolved",
    keyNeeds: "Key needs",
    recommendedServices: "Recommended services",
    handoverNotes: "Handover notes",
    caregiverNote: "Caregiver information",
    financialNote: "Financial considerations",
    recentTransition: "Recent transition",
  },

  zh: {
    // Landing
    tagline: "您的护理伙伴，为您指明方向。",
    modeTitle: "今天谁需要帮助？",
    modeForMyself: "为我自己",
    modeForMyselfDesc: "我是需要护理支援的长者",
    modeForSomeone: "为我照顾的人",
    modeForSomeonDesc: "我是家属或护理员",
    languageLabel: "选择语言",
    pdpaNote: "您的信息将被保密，仅用于寻找合适的护理服务。我们遵守个人数据保护法。",
    getStarted: "开始",

    // Chat
    chatWelcomeSelf:
      "你好！我是CareKaki 👋 我在这里帮您找到合适的护理支援——不只是一个服务列表，而是针对您情况的个性化指导。告诉我一些关于您自己的情况和您需要什么。",
    chatWelcomeCaregiver:
      "你好！我是CareKaki 👋 我在这里帮您为您的亲人找到合适的护理服务。告诉我关于您照顾的人——他们是谁，以及最近发生了什么。",
    profileTitle: "护理档案",
    profileBuilding: "正在了解您的情况...",
    profileComplete: "档案完成",
    navigateCare: "查看护理路径",
    talkToHuman: "与真人交谈",
    typeMessage: "输入您的信息...",
    voiceInput: "语音输入",
    sendMessage: "发送",
    runDemo: "▶ 运行演示（陈女士情景）",

    // Profile fields
    aboutPerson: "关于当事人",
    careNeeds: "护理需求",
    caregiverContext: "护理员",
    financialInfo: "经济情况",
    transitionStatus: "过渡状态",

    // Pathway
    pathwayTitle: "个性化护理路径",
    pathwayFor: "为以下人士个性化",
    pathwayDesc: "这些不是随机的服务——每项服务都是根据您的具体情况推荐的。",
    urgencyImmediate: "立即",
    urgencyShortTerm: "短期",
    urgencyOngoing: "持续",
    becauseYou: "为什么适合您",
    nextStep: "下一步",
    requestCoordinator: "联系关怀角护理协调员",
    escalationTitle: "协调员可以提供帮助",
    escalationNote:
      "鉴于所需的服务数量，关怀角护理协调员可以统筹安排一切——您只需讲述一次您的故事。",

    // Coordinator
    coordinatorTitle: "协调员仪表板",
    coordinatorCases: "待处理案例",
    careBrief: "护理简报",
    acceptCase: "接受案例",
    scheduleCallback: "安排回访",
    urgentLabel: "紧急",
    pendingLabel: "待处理",
    acceptedLabel: "已接受",
    inProgressLabel: "进行中",
    resolvedLabel: "已解决",
    keyNeeds: "主要需求",
    recommendedServices: "推荐服务",
    handoverNotes: "交接说明",
    caregiverNote: "护理员信息",
    financialNote: "经济注意事项",
    recentTransition: "近期过渡",
  },

  ms: {
    tagline: "Rakan penjagaan anda yang tahu di mana untuk bermula.",
    modeTitle: "Siapa yang memerlukan bantuan hari ini?",
    modeForMyself: "Untuk saya sendiri",
    modeForMyselfDesc: "Saya warga tua yang memerlukan sokongan penjagaan",
    modeForSomeone: "Untuk seseorang yang saya jaga",
    modeForSomeonDesc: "Saya ahli keluarga atau penjaga",
    languageLabel: "Pilih bahasa",
    pdpaNote:
      "Maklumat anda disimpan secara sulit dan hanya digunakan untuk mencari perkhidmatan penjagaan yang sesuai.",
    getStarted: "Mulakan",
    chatWelcomeSelf:
      "Hai! Saya CareKaki 👋 Saya di sini untuk membantu anda mencari sokongan penjagaan yang tepat.",
    chatWelcomeCaregiver:
      "Hai! Saya CareKaki 👋 Saya di sini untuk membantu anda mencari penjagaan yang tepat untuk orang yang anda sayangi.",
    profileTitle: "Profil Penjagaan",
    profileBuilding: "Memahami situasi anda...",
    profileComplete: "Profil lengkap",
    navigateCare: "Lihat Laluan Penjagaan",
    talkToHuman: "Bercakap dengan manusia",
    typeMessage: "Taip mesej anda...",
    voiceInput: "Input suara",
    sendMessage: "Hantar",
    runDemo: "▶ Jalankan demo",
    aboutPerson: "Tentang orang tersebut",
    careNeeds: "Keperluan penjagaan",
    caregiverContext: "Penjaga",
    financialInfo: "Kewangan",
    transitionStatus: "Peralihan",
    pathwayTitle: "Laluan Penjagaan Diperibadikan",
    pathwayFor: "Diperibadikan untuk",
    pathwayDesc: "Setiap perkhidmatan disyorkan berdasarkan profil khusus anda.",
    urgencyImmediate: "Segera",
    urgencyShortTerm: "Jangka pendek",
    urgencyOngoing: "Berterusan",
    becauseYou: "Mengapa ini untuk anda",
    nextStep: "Langkah seterusnya",
    requestCoordinator: "Hubungi penyelaras Care Corner",
    escalationTitle: "Penyelaras boleh membantu",
    escalationNote:
      "Penyelaras penjagaan Care Corner boleh menguruskan semua perkhidmatan bersama-sama.",
    coordinatorTitle: "Papan Pemuka Penyelaras",
    coordinatorCases: "Kes masuk",
    careBrief: "Ringkasan Penjagaan",
    acceptCase: "Terima kes",
    scheduleCallback: "Jadualkan panggilan balik",
    urgentLabel: "Mendesak",
    pendingLabel: "Belum selesai",
    acceptedLabel: "Diterima",
    inProgressLabel: "Dalam proses",
    resolvedLabel: "Diselesaikan",
    keyNeeds: "Keperluan utama",
    recommendedServices: "Perkhidmatan yang disyorkan",
    handoverNotes: "Nota serah terima",
    caregiverNote: "Maklumat penjaga",
    financialNote: "Pertimbangan kewangan",
    recentTransition: "Peralihan terkini",
  },

  ta: {
    tagline: "உங்கள் பராமரிப்பு நண்பர் — எங்கு தொடங்குவதென்று தெரியும்.",
    modeTitle: "இன்று யாருக்கு உதவி தேவை?",
    modeForMyself: "என்னுடையதற்காக",
    modeForMyselfDesc: "நான் பராமரிப்பு ஆதரவு தேவைப்படும் மூத்தவர்",
    modeForSomeone: "நான் கவனிக்கும் ஒருவருக்காக",
    modeForSomeonDesc: "நான் குடும்ப உறுப்பினர் அல்லது பராமரிப்பாளர்",
    languageLabel: "மொழியை தேர்ந்தெடுக்கவும்",
    pdpaNote:
      "உங்கள் தகவல் தனிப்பட்டதாக வைக்கப்படும், பொருத்தமான பராமரிப்பு சேவைகளை கண்டறிய மட்டுமே பயன்படுத்தப்படும்.",
    getStarted: "தொடங்குங்கள்",
    chatWelcomeSelf:
      "வணக்கம்! நான் CareKaki 👋 உங்களுக்கு சரியான பராமரிப்பு ஆதரவு கண்டறிய உதவுகிறேன்.",
    chatWelcomeCaregiver:
      "வணக்கம்! நான் CareKaki 👋 உங்கள் அன்பானவருக்கு சரியான பராமரிப்பு கண்டறிய உதவுகிறேன்.",
    profileTitle: "பராமரிப்பு சுயவிவரம்",
    profileBuilding: "உங்கள் நிலைமையை புரிந்துகொள்கிறேன்...",
    profileComplete: "சுயவிவரம் முழுமையானது",
    navigateCare: "பராமரிப்பு பாதையை காண்க",
    talkToHuman: "மனிதனுடன் பேசுங்கள்",
    typeMessage: "உங்கள் செய்தியை தட்டச்சு செய்யுங்கள்...",
    voiceInput: "குரல் உள்ளீடு",
    sendMessage: "அனுப்பு",
    runDemo: "▶ டெமோ இயக்கு",
    aboutPerson: "நபரைப் பற்றி",
    careNeeds: "பராமரிப்பு தேவைகள்",
    caregiverContext: "பராமரிப்பாளர்",
    financialInfo: "நிதி நிலை",
    transitionStatus: "மாற்றம்",
    pathwayTitle: "தனிப்பயனாக்கப்பட்ட பராமரிப்பு பாதை",
    pathwayFor: "தனிப்பயனாக்கப்பட்டது",
    pathwayDesc:
      "ஒவ்வொரு சேவையும் உங்கள் குறிப்பிட்ட சுயவிவரத்தின் அடிப்படையில் பரிந்துரைக்கப்படுகிறது.",
    urgencyImmediate: "உடனடி",
    urgencyShortTerm: "குறுகிய கால",
    urgencyOngoing: "தொடர்ச்சியான",
    becauseYou: "ஏன் இது உங்களுக்கு",
    nextStep: "அடுத்த படி",
    requestCoordinator: "Care Corner ஒருங்கிணைப்பாளரை தொடர்பு கொள்ளுங்கள்",
    escalationTitle: "ஒருங்கிணைப்பாளர் உதவலாம்",
    escalationNote:
      "Care Corner பராமரிப்பு ஒருங்கிணைப்பாளர் அனைத்தையும் நிர்வகிக்கலாம்.",
    coordinatorTitle: "ஒருங்கிணைப்பாளர் டாஷ்போர்டு",
    coordinatorCases: "வரும் வழக்குகள்",
    careBrief: "பராமரிப்பு சுருக்கம்",
    acceptCase: "வழக்கை ஏற்கவும்",
    scheduleCallback: "திரும்ப அழைப்பை திட்டமிடுங்கள்",
    urgentLabel: "அவசரம்",
    pendingLabel: "நிலுவை",
    acceptedLabel: "ஏற்கப்பட்டது",
    inProgressLabel: "செயலில் உள்ளது",
    resolvedLabel: "தீர்க்கப்பட்டது",
    keyNeeds: "முக்கிய தேவைகள்",
    recommendedServices: "பரிந்துரைக்கப்பட்ட சேவைகள்",
    handoverNotes: "கையளிப்பு குறிப்புகள்",
    caregiverNote: "பராமரிப்பாளர் தகவல்",
    financialNote: "நிதி கருத்தாய்வுகள்",
    recentTransition: "சமீபத்திய மாற்றம்",
  },
} as const;

export type TranslationKey = keyof typeof translations.en;

export function t(lang: Language, key: TranslationKey): string {
  const dict = translations[lang] as Record<string, string>;
  return dict[key] ?? (translations.en as Record<string, string>)[key] ?? key;
}

export const LANGUAGE_LABELS: Record<Language, string> = {
  en: "English",
  zh: "中文",
  ms: "Melayu",
  ta: "தமிழ்",
};
