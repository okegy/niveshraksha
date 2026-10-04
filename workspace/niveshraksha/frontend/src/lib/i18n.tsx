"use client";

// Minimal multilingual (English / Tamil / Hindi / Telugu / Malayalam / Kannada)
// UI dictionary + context provider. Educational content itself comes from the
// backend content files; this only covers chrome strings. Preference persists
// in localStorage via an external store (SSR-safe, no setState-in-effect).

import {
  createContext,
  useCallback,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";

export type Language = "en" | "ta" | "hi" | "te" | "ml" | "kn";

export const LANGUAGE_OPTIONS: { code: Language; native: string; english: string }[] = [
  { code: "en", native: "English", english: "English" },
  { code: "ta", native: "தமிழ்", english: "Tamil" },
  { code: "hi", native: "हिंदी", english: "Hindi" },
  { code: "te", native: "తెలుగు", english: "Telugu" },
  { code: "ml", native: "മലയാളം", english: "Malayalam" },
  { code: "kn", native: "ಕನ್ನಡ", english: "Kannada" },
];

const dict = {
  en: {
    nav_analyze: "Check a Message",
    nav_verify: "Verify an Advisor",
    nav_learn: "Learn",
    nav_pause: "Pause",
    nav_report: "Evidence Locker",
    nav_about: "About",
    language_label: "Language",
    landing_title: "Pause. Verify. Protect.",
    landing_sub:
      "Help yourself and your loved ones identify suspicious financial messages, verify advisors, and take safe next steps. We do not provide investment advice.",
    card_analyze_title: "Check a Message",
    card_analyze_body:
      "Received a tip on WhatsApp or Telegram? Check it for common scam warning signs.",
    card_verify_title: "Verify an Advisor",
    card_verify_body:
      "Someone claiming to be SEBI registered? Check their credentials before sending money.",
    analyze_now: "Analyze Message",
    verify_now: "Verify Now",
    disclaimer_title: "Safety Disclaimer",
    disclaimer_body:
      'NiveshRaksha is an educational and safety tool. We do not offer financial, investment, or legal advice. A "no red flags" result does not guarantee that an investment is safe or legitimate. Always verify independently through official regulatory bodies like SEBI.',
    footer: "NiveshRaksha — Investor Resilience Platform. A Sangyan Hackathon Project.",
  },
  ta: {
    nav_analyze: "செய்தியை சரிபார்க்கவும்",
    nav_verify: "ஆலோசகரை சரிபார்க்கவும்",
    nav_learn: "கற்றுக்கொள்ளுங்கள்",
    nav_pause: "இடைநிறுத்தம்",
    nav_report: "ஆதாரப் பெட்டகம்",
    nav_about: "பற்றி",
    language_label: "மொழி",
    landing_title: "நிறுத்துங்கள். சரிபார்க்கவும். பாதுகாக்கவும்.",
    landing_sub:
      "சந்தேகத்திற்குரிய நிதி செய்திகளை அடையாளம் கண்டு, ஆலோசகர்களை சரிபார்த்து, பாதுகாப்பான அடுத்த படிகளை எடுக்க உங்களுக்கும் உங்கள் குடும்பத்தினருக்கும் உதவுங்கள். நாங்கள் முதலீட்டு ஆலோசனை வழங்குவதில்லை.",
    card_analyze_title: "செய்தியை சரிபார்க்கவும்",
    card_analyze_body:
      "WhatsApp அல்லது Telegram இல் ஒரு குறிப்பு வந்ததா? பொதுவான மோசடி எச்சரிக்கை அறிகுறிகளுக்காக சரிபாருங்கள்.",
    card_verify_title: "ஆலோசகரை சரிபார்க்கவும்",
    card_verify_body:
      "SEBI பதிவுசெய்ததாக கூறுகிறார்களா? பணம் அனுப்புவதற்கு முன் அவர்களின் சான்றுகளை சரிபாருங்கள்.",
    analyze_now: "செய்தியை பகுப்பாய்வு செய்யுங்கள்",
    verify_now: "இப்போதே சரிபார்க்கவும்",
    disclaimer_title: "பாதுகாப்பு எச்சரிக்கை",
    disclaimer_body:
      "NiveshRaksha ஒரு கல்வி மற்றும் பாதுகாப்பு கருவி. நாங்கள் நிதி, முதலீடு அல்லது சட்ட ஆலோசனை வழங்குவதில்லை. 'எந்த சிவப்பு கொடியும் இல்லை' என்ற முடிவு ஒரு முதலீடு பாதுகாப்பானது என்று உத்தரவாதம் அளிக்காது. SEBI போன்ற அதிகாரப்பூர்வ அமைப்புகள் மூலம் எப்போதும் சுயாதீனமாக சரிபார்க்கவும்.",
    footer: "NiveshRaksha — முதலீட்டாளர் மீள்திறன் தளம். Sangyan ஹேக்கத்தான் திட்டம்.",
  },
  hi: {
    nav_analyze: "संदेश जांचें",
    nav_verify: "एडवाइज़र जांचें",
    nav_learn: "सीखें",
    nav_pause: "रुकें",
    nav_report: "साक्ष्य लॉकर",
    nav_about: "परिचय",
    language_label: "भाषा",
    landing_title: "रुकें। जांचें। सुरक्षित रहें।",
    landing_sub:
      "संदिग्ध वित्तीय संदेशों को पहचानने, सलाहकारों की जांच करने और सुरक्षित अगले कदम उठाने में खुद और अपने प्रियजनों की मदद करें। हम निवेश सलाह नहीं देते।",
    card_analyze_title: "संदेश जांचें",
    card_analyze_body: "WhatsApp या Telegram पर कोई टिप मिली? आम घोटाले के संकेतों के लिए जांचें।",
    card_verify_title: "एडवाइज़र जांचें",
    card_verify_body: "कोई SEBI पंजीकृत होने का दावा कर रहा है? पैसा भेजने से पहले उसके दस्तावेज़ जांचें।",
    analyze_now: "संदेश जांचें",
    verify_now: "अभी जांचें",
    disclaimer_title: "सुरक्षा अस्वीकरण",
    disclaimer_body:
      "NiveshRaksha एक शैक्षिक और सुरक्षा उपकरण है। हम वित्तीय, निवेश या कानूनी सलाह नहीं देते। 'कोई लाल झंडा नहीं' का परिणाम निवेश के सुरक्षित होने की गारंटी नहीं है। SEBI जैसे आधिकारिक नियामकों से हमेशा स्वतंत्र रूप से जांचें।",
    footer: "NiveshRaksha — निवेशक मजबूती मंच। Sangyan हैकाथॉन परियोजना।",
  },
  te: {
    nav_analyze: "సందేశం తనిఖీ",
    nav_verify: "సలహాదారు తనిఖీ",
    nav_learn: "నేర్చుకోండి",
    nav_pause: "ఆగండి",
    nav_report: "సాక్ష్య పెట్టె",
    nav_about: "గురించి",
    language_label: "భాష",
    landing_title: "ఆగండి. ధృవీకరించండి. రక్షించుకోండి.",
    landing_sub:
      "అనుమానాస్పద ఆర్థిక సందేశాలను గుర్తించడంలో, సలహాదారులను ధృవీకరించడంలో మరియు సురక్షితమైన తదుపరి చర్యలు తీసుకోవడంలో మిమ్మల్ని మీరు, మీ కుటుంబాన్ని సహాయం చేయండి. మేము పెట్టుబడి సలహా ఇవ్వము.",
    card_analyze_title: "సందేశం తనిఖీ",
    card_analyze_body: "WhatsApp లేదా Telegram లో చిట్కా వచ్చిందా? సాధారణ మోసపూరిత సూచనల కోసం తనిఖీ చేయండి.",
    card_verify_title: "సలహాదారు ధృవీకరణ",
    card_verify_body: "SEBI నమోదైనట్లు చెబుతున్నారా? డబ్బు పంపే ముందు వారి ఆధారాలు తనిఖీ చేయండి.",
    analyze_now: "సందేశం విశ్లేషించండి",
    verify_now: "ఇప్పుడే ధృవీకరించండి",
    disclaimer_title: "భద్రతా నిరాకరణ",
    disclaimer_body:
      "NiveshRaksha ఒక విద్యా మరియు భద్రతా సాధనం. మేము ఆర్థిక, పెట్టుబడి లేదా చట్టపరమైన సలహా ఇవ్వము. 'ఎటువంటి రెడ్ ఫ్లాగ్స్ లేవు' అనే ఫలితం పెట్టుబడి సురక్షితమే అని హామీ ఇవ్వదు. SEBI వంటి అధికారిక సంస్థల ద్వారా ఎప్పుడూ స్వతంత్రంగా ధృవీకరించండి.",
    footer: "NiveshRaksha — పెట్టుబడిదారు మనోబల వేదిక. Sangyan హ్యాకతాన్ ప్రాజెక్ట్.",
  },
  ml: {
    nav_analyze: "സന്ദേശം പരിശോധിക്കുക",
    nav_verify: "ഉപദേശകൻ പരിശോധിക്കുക",
    nav_learn: "പഠിക്കുക",
    nav_pause: "നിർത്തുക",
    nav_report: "തെളിവ് പെട്ടി",
    nav_about: "കുറിച്ച്",
    language_label: "ഭാഷ",
    landing_title: "നിർത്തുക. സ്ഥിരീകരിക്കുക. സംരക്ഷിക്കുക.",
    landing_sub:
      "സംശയാസ്പദമായ സാമ്പത്തിക സന്ദേശങ്ങൾ തിരിച്ചറിയാനും ഉപദേശകരെ സ്ഥിരീകരിക്കാനും സുരക്ഷിതമായ അടുത്ത ഘട്ടങ്ങൾ എടുക്കാനും നിങ്ങളെയും പ്രിയപ്പെട്ടവരെയും സഹായിക്കുക. ഞങ്ങൾ നിക്ഷേപ ഉപദേശം നൽകുന്നില്ല.",
    card_analyze_title: "സന്ദേശം പരിശോധിക്കുക",
    card_analyze_body: "WhatsApp അല്ലെങ്കിൽ Telegram ൽ ഒരു സൂചന വന്നോ? സാധാരണ തട്ടിപ്പ് ലക്ഷണങ്ങൾക്കായി പരിശോധിക്കുക.",
    card_verify_title: "ഉപദേശകനെ സ്ഥിരീകരിക്കുക",
    card_verify_body: "SEBI രജിസ്റ്റേഡ് ആണെന്ന് അവകാശപ്പെടുന്നുണ്ടോ? പണം അയയ്ക്കും മുമ്പ് അവരുടെ യോഗ്യതകൾ പരിശോധിക്കുക.",
    analyze_now: "സന്ദേശം വിശകലനം ചെയ്യുക",
    verify_now: "ഇപ്പോൾ സ്ഥിരീകരിക്കുക",
    disclaimer_title: "സുരക്ഷാ ഡിസ്ക്ലെയ്മർ",
    disclaimer_body:
      "NiveshRaksha ഒരു വിദ്യാഭ്യാസ, സുരക്ഷാ ഉപകരണമാണ്. ഞങ്ങൾ സാമ്പത്തിക, നിക്ഷേപ, നിയമ ഉപദേശം നൽകുന്നില്ല. 'റെഡ് ഫ്ലാഗുകളില്ല' എന്ന ഫലം നിക്ഷേപം സുരക്ഷിതമാണെന്ന് ഉറപ്പ് നൽകുന്നില്ല. SEBI പോലുള്ള ഔദ്യോഗിക നിയന്ത്രണ സ്ഥാപനങ്ങളിലൂടെ എപ്പോഴും സ്വതന്ത്രമായി സ്ഥിരീകരിക്കുക.",
    footer: "NiveshRaksha — നിക്ഷേപക പ്രതിരോധ വേദി. Sangyan ഹാക്കത്തോൺ പദ്ധതി.",
  },
  kn: {
    nav_analyze: "ಸಂದೇಶ ಪರಿಶೀಲನೆ",
    nav_verify: "ಸಲಹೆಗಾರ ಪರಿಶೀಲನೆ",
    nav_learn: "ಕಲಿಯಿರಿ",
    nav_pause: "ವಿರಾಮ",
    nav_report: "ಸಾಕ್ಷ್ಯ ಪೆಟ್ಟಿಗೆ",
    nav_about: "ಬಗ್ಗೆ",
    language_label: "ಭಾಷೆ",
    landing_title: "ನಿಲ್ಲಿಸಿ. ಪರಿಶೀಲಿಸಿ. ರಕ್ಷಿಸಿ.",
    landing_sub:
      "ಅನುಮಾನಾಸ್ಪದ ಆರ್ಥಿಕ ಸಂದೇಶಗಳನ್ನು ಗುರುತಿಸಲು, ಸಲಹೆಗಾರರನ್ನು ಪರಿಶೀಲಿಸಲು ಮತ್ತು ಸುರಕ್ಷಿತ ಮುಂದಿನ ಹೆಜ್ಜೆಗಳನ್ನು ತೆಗೆದುಕೊಳ್ಳಲು ನಿಮಗೆ ಮತ್ತು ನಿಮ್ಮ ಪ್ರೀತಿಪಾತ್ರರಿಗೆ ಸಹಾಯ ಮಾಡಿ. ನಾವು ಹೂಡಿಕೆ ಸಲಹೆ ನೀಡುವುದಿಲ್ಲ.",
    card_analyze_title: "ಸಂದೇಶ ಪರಿಶೀಲನೆ",
    card_analyze_body: "WhatsApp ಅಥವಾ Telegram ನಲ್ಲಿ ಸಲಹೆ ಬಂದಿದೆಯೇ? ಸಾಮಾನ್ಯ ವಂಚನೆ ಸೂಚನೆಗಳಿಗಾಗಿ ಪರಿಶೀಲಿಸಿ.",
    card_verify_title: "ಸಲಹೆಗಾರರನ್ನು ಪರಿಶೀಲಿಸಿ",
    card_verify_body: "SEBI ನೋಂದಾಯಿತರು ಎಂದು ಹೇಳುತ್ತಿದ್ದಾರಾ? ಹಣ ಕಳುಹಿಸುವ ಮೊದಲು ಅವರ ಅರ್ಹತೆಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.",
    analyze_now: "ಸಂದೇಶ ವಿಶ್ಲೇಷಿಸಿ",
    verify_now: "ಈಗಲೇ ಪರಿಶೀಲಿಸಿ",
    disclaimer_title: "ಸುರಕ್ಷತಾ ಅಸ್ವೀಕರಣ",
    disclaimer_body:
      "NiveshRaksha ಒಂದು ಶೈಕ್ಷಣಿಕ ಮತ್ತು ಸುರಕ್ಷತಾ ಸಾಧನ. ನಾವು ಆರ್ಥಿಕ, ಹೂಡಿಕೆ ಅಥವಾ ಕಾನೂನು ಸಲಹೆ ನೀಡುವುದಿಲ್ಲ. 'ಯಾವುದೇ ರೆಡ್ ಫ್ಲ್ಯಾಗ್ ಇಲ್ಲ' ಎಂಬ ಫಲಿತಾಂಶ ಹೂಡಿಕೆ ಸುರಕ್ಷಿತ ಎಂದು ಖಾತರಿ ನೀಡುವುದಿಲ್ಲ. SEBI ಯಂತಹ ಅಧಿಕೃತ ನಿಯಂತ್ರಕ ಸಂಸ್ಥೆಗಳ ಮೂಲಕ ಯಾವಾಗಲೂ ಸ್ವತಂತ್ರವಾಗಿ ಪರಿಶೀಲಿಸಿ.",
    footer: "NiveshRaksha — ಹೂಡಿಕೆದಾರ ಸ್ಥಿತಿಸ್ಥಾಪಕತ್ವ ವೇದಿಕೆ. Sangyan ಹ್ಯಾಕಥಾನ್ ಯೋಜನೆ.",
  },
} as const;

export type DictKey = keyof (typeof dict)["en"];

const STORAGE_KEY = "nr_language";
const SUPPORTED: Language[] = ["en", "ta", "hi", "te", "ml", "kn"];

// The language preference is an external store (localStorage) mirrored into
// React via useSyncExternalStore — SSR-safe, no setState-in-effect.
type Listener = () => void;
const listeners = new Set<Listener>();

function subscribe(listener: Listener) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function getLanguageSnapshot(): Language {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return (SUPPORTED as string[]).includes(stored ?? "") ? (stored as Language) : "en";
}

function getServerLanguage(): Language {
  return "en";
}

interface LanguageContextValue {
  language: Language;
  setLanguage: (l: Language) => void;
  t: (key: DictKey) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  language: "en",
  setLanguage: () => {},
  t: (key) => dict.en[key],
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const language = useSyncExternalStore(subscribe, getLanguageSnapshot, getServerLanguage);

  const setLanguage = useCallback((l: Language) => {
    window.localStorage.setItem(STORAGE_KEY, l);
    listeners.forEach((notify) => notify());
  }, []);

  const t = useCallback(
    (key: DictKey) => (dict[language] as Record<DictKey, string>)[key] ?? dict.en[key],
    [language],
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
