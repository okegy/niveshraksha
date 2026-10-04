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

export type Language = "en" | "ta" | "hi" | "te" | "ml" | "kn" | "bn" | "mr" | "gu" | "or" | "pa" | "as";

export const LANGUAGE_OPTIONS: { code: Language; native: string; english: string }[] = [
  { code: "en", native: "English", english: "English" },
  { code: "ta", native: "தமிழ்", english: "Tamil" },
  { code: "hi", native: "हिंदी", english: "Hindi" },
  { code: "te", native: "తెలుగు", english: "Telugu" },
  { code: "ml", native: "മലയാളം", english: "Malayalam" },
  { code: "kn", native: "ಕನ್ನಡ", english: "Kannada" },
  { code: "bn", native: "বাংলা", english: "Bengali" },
  { code: "mr", native: "मराठी", english: "Marathi" },
  { code: "gu", native: "ગુજરાતી", english: "Gujarati" },
  { code: "or", native: "ଓଡ଼ିଆ", english: "Odia" },
  { code: "pa", native: "ਪੰਜਾਬੀ", english: "Punjabi" },
  { code: "as", native: "অসমীয়া", english: "Assamese" },
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
    footer: "NiveshRaksha — Investor Resilience Platform. Created by Akash Kishore.",
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
    footer: "NiveshRaksha — முதலீட்டாளர் மீள்திறன் தளம். Akash Kishore உருவாக்கியது.",
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
    footer: "NiveshRaksha — निवेशक मजबूती मंच। Akash Kishore द्वारा निर्मित।",
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
    footer: "NiveshRaksha — పెట్టుబడిదారు మనోబల వేదిక. Akash Kishore ద్వారా రూపొందించబడింది.",
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
    footer: "NiveshRaksha — നിക്ഷേപക പ്രതിരോധ വേദി. Akash Kishore നിർമ്മിച്ചത്.",
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
    footer: "NiveshRaksha — ಹೂಡಿಕೆದಾರ ಸ್ಥಿತಿಸ್ಥಾಪಕತ್ವ ವೇದಿಕೆ. Akash Kishore ರಚಿಸಿದ್ದಾರೆ.",
  },
  bn: {
    nav_analyze: "বার্তা যাচাই",
    nav_verify: "উপদেষ্টা যাচাই",
    nav_learn: "শিখুন",
    nav_pause: "বিরতি",
    nav_report: "প্রমাণ সংগ্রহ",
    nav_about: "সম্পর্কে",
    language_label: "ভাষা",
    landing_title: "থামুন। যাচাই করুন। সুরক্ষিত থাকুন।",
    landing_sub: "সন্দেহজনক আর্থিক বার্তা চিনতে, উপদেষ্টা যাচাই করতে ও নিরাপদ পরবর্তী পদক্ষেপ নিতে নিজে ও পরিবারকে সাহায্য করুন। আমরা বিনিয়োগ পরামর্শ দিই না।",
    card_analyze_title: "বার্তা যাচাই",
    card_analyze_body: "WhatsApp বা Telegram-এ টিপস এসেছে? সাধারণ প্রতারণার লক্ষণ যাচাই করুন।",
    card_verify_title: "উপদেষ্টা যাচাই",
    card_verify_body: "SEBI নিবন্ধিত দাবি করছেন? টাকা পাঠানোর আগে যাচাই করুন।",
    analyze_now: "বার্তা বিশ্লেষণ করুন",
    verify_now: "এখনই যাচাই করুন",
    disclaimer_title: "নিরাপত্তা সতর্কতা",
    disclaimer_body: "NiveshRaksha একটি শিক্ষামূলক ও নিরাপত্তা সরঞ্জাম। আমরা আর্থিক, বিনিয়োগ বা আইনি পরামর্শ দিই না। 'কোনো লাল পতাকা নেই' মানে বিনিয়োগ নিরাপদ — এমন গ্যারান্টি নয়। SEBI-এর মতো অফিসিয়াল সূত্রে স্বাধীনভাবে যাচাই করুন।",
    footer: "NiveshRaksha — বিনিয়োগকারী স্থিতিস্থাপকতা প্ল্যাটফর্ম। Akash Kishore নির্মিত।",
  },
  mr: {
    nav_analyze: "संदेश तपासा",
    nav_verify: "सल्लागार तपासा",
    nav_learn: "शिका",
    nav_pause: "थांबा",
    nav_report: "पुरावा संग्रह",
    nav_about: "माहिती",
    language_label: "भाषा",
    landing_title: "थांबा. तपासा. सुरक्षित राहा.",
    landing_sub: "संशयास्पद आर्थिक संदेश ओळखण्यात, सल्लागार तपासण्यात आणि सुरक्षित पुढील पावले उचलण्यात स्वतःची व कुटुंबाची मदत करा. आम्ही गुंतवणूक सल्ला देत नाही.",
    card_analyze_title: "संदेश तपासा",
    card_analyze_body: "WhatsApp किंवा Telegram वर टिप आली? सामान्य फसवणुकीची लक्षणे तपासा.",
    card_verify_title: "सल्लागार तपासा",
    card_verify_body: "SEBI नोंदणीकृत असल्याचा दावा? पैसे पाठवण्यापूर्वी तपासा.",
    analyze_now: "संदेश विश्लेषण करा",
    verify_now: "आता तपासा",
    disclaimer_title: "सुरक्षा सूचना",
    disclaimer_body: "NiveshRaksha हे शैक्षणिक व सुरक्षा साधन आहे. आम्ही आर्थिक, गुंतवणूक किंवा कायदेशीर सल्ला देत नाही. 'कोणतीही चिन्हे नाहीत' म्हणजे गुंतवणूक सुरक्षित असल्याची खात्री नाही. SEBI सारख्या अधिकृत संस्थांकडून स्वतंत्रपणे तपासा.",
    footer: "NiveshRaksha — गुंतवणूकदार स्थैर्य व्यासपीठ. Akash Kishore यांनी बनावले.",
  },
  gu: {
    nav_analyze: "સંદેશ તપાસો",
    nav_verify: "સલાહકાર તપાસો",
    nav_learn: "શીખો",
    nav_pause: "વિરામ",
    nav_report: "પુરાવા સંગ્રહ",
    nav_about: "વિશે",
    language_label: "ભાષા",
    landing_title: "અટકો. ચકાસો. સુરક્ષિત રહો.",
    landing_sub: "શંકાસ્પદ નાણાકીય સંદેશા ઓળખવા, સલાહકાર ચકાસવા અને સુરક્ષિત પગલાં લેવા પોતાને અને પરિવારને મદદ કરો. આપણે રોકાણ સલાહ આપતા નથી.",
    card_analyze_title: "સંદેશ તપાસો",
    card_analyze_body: "WhatsApp કે Telegram પર ટીપ આવી? સામાન્ય છેતરપટ્ટીના સંકેતો તપાસો.",
    card_verify_title: "સલાહકાર ચકાસો",
    card_verify_body: "SEBI નોંધાયેલા હોવાનો દાવો? પૈસા મોકલતાં પહેલાં ચકાસો.",
    analyze_now: "સંદેશ વિશ્લેષણ કરો",
    verify_now: "હવે ચકાસો",
    disclaimer_title: "સલામતી નિરાકરણ",
    disclaimer_body: "NiveshRaksha એ શૈક્ષણિક અને સુરક્ષા સાધન છે. આપણે નાણાકીય, રોકાણ કે કાનૂની સલાહ આપતા નથી. 'કોઈ રેડ ફ્લેગ નથી' એટલે રોકાણ સલામત — આવી ગેરંટી નથી. SEBI જેવી અધિકૃત સંસ્થા પાસેથી સ્વતંત્ર રીતે ચકાસો.",
    footer: "NiveshRaksha — રોકાણકાર સ્થિતિસ્થાપકતા પ્લેટફોર્મ. Akash Kishore દ્વારા નિર્મિત.",
  },
  or: {
    nav_analyze: "ମେସେଜ ଯାଞ୍ଚ",
    nav_verify: "ପରାମର୍ଶଦାତା ଯାଞ୍ଚ",
    nav_learn: "ଶିଖନ୍ତୁ",
    nav_pause: "ବିରାମ",
    nav_report: "ପ୍ରମାଣ ସଂଗ୍ରହ",
    nav_about: "ବିଷୟରେ",
    language_label: "ଭାଷା",
    landing_title: "ଅଟକନ୍ତୁ। ଯାଞ୍ଚ କରନ୍ତୁ। ସୁରକ୍ଷିତ ରହନ୍ତୁ।",
    landing_sub: "ସନ୍ଦେହଜନକ ଆର୍ଥିକ ମେସେଜ ଚିହ୍ନଟ, ପରାମର୍ଶଦାତା ଯାଞ୍ଚ ଓ ସୁରକ୍ଷିତ ପଦକ୍ଷେପ ପାଇଁ ନିଜ ଓ ପରିବାରକୁ ସାହାଯ୍ୟ କରନ୍ତୁ। ଆମେ ବିନିଯୋଗ ପରାମର୍ଶ ଦିଇ ନାହଁ।",
    card_analyze_title: "ମେସେଜ ଯାଞ୍ଚ",
    card_analyze_body: "WhatsApp କିମ୍ବା Telegram ରେ ଟିପ୍ସ ଆସିଲା? ସାଧାରଣ ଠକେଇ ଚିହ୍ନ ଯାଞ୍ଚ କରନ୍ତୁ।",
    card_verify_title: "ପରାମର୍ଶଦାତା ଯାଞ୍ଚ",
    card_verify_body: "SEBI ପଞ୍ଜିକୃତ ଦାବି କରୁଛନ୍ତି? ପଇସା ପଠାଇବା ପୂର୍ବରୁ ଯାଞ୍ଚ କରନ୍ତୁ।",
    analyze_now: "ମେସେଜ ବିଶ୍ଳେଷଣ କରନ୍ତୁ",
    verify_now: "ଏବେ ଯାଞ୍ଚ କରନ୍ତୁ",
    disclaimer_title: "ନିରାପତ୍ତା ଘୋଷଣା",
    disclaimer_body: "NiveshRaksha ଏକ ଶିକ୍ଷାମୂଳକ ଓ ନିରାପତ୍ତା ସାଧନ। ଆମେ ଆର୍ଥିକ, ବିନିଯୋଗ କିମ୍ବା ଆଇନଗତ ପରାମର୍ଶ ଦିଇ ନାହଁ। 'କୌଣସି ଚିହ୍ନ ନାହିଁ' ଅର୍ଥ ବିନିଯୋଗ ସୁରକ୍ଷିତ — ଏହା ଗାରଣ୍ଟି ନୁହେଁ। SEBI ପରି ଅଫିସିଆଲ୍ ଅନୁଷ୍ଠାନ ଦ୍ୱାରା ସ୍ୱାଧୀନ ଭାବରେ ଯାଞ୍ଚ କରନ୍ତୁ।",
    footer: "NiveshRaksha — ବିନିଯୋଗକାରୀ ସ୍ଥିତିସ୍ଥାପକତା ପ୍ଲାଟଫର୍ମ। Akash Kishore ଦ୍ୱାରା ନିର୍ମିତ।",
  },
  pa: {
    nav_analyze: "ਸੁਨੇਹਾ ਜਾਂਚ",
    nav_verify: "ਸਲਾਹਕਾਰ ਜਾਂਚ",
    nav_learn: "ਸਿੱਖੋ",
    nav_pause: "ਵਿਸਰਾਮ",
    nav_report: "ਸਬੂਤ ਭੰਡਾਰ",
    nav_about: "ਬਾਰੇ",
    language_label: "ਭਾਸ਼ਾ",
    landing_title: "ਰੁਕੋ। ਜਾਂਚੋ। ਸੁਰੱਖਿਅਤ ਰਹੋ।",
    landing_sub: "ਸ਼ੱਕੀ ਵਿੱਤੀ ਸੁਨੇਹੇ ਪਛਾਣਨ, ਸਲਾਹਕਾਰ ਦੀ ਜਾਂਚ ਅਤੇ ਸੁਰੱਖਿਅਤ ਅਗਲੇ ਕਦਮ ਲਈ ਖੁਦ ਅਤੇ ਪਰਿਵਾਰ ਦੀ ਮਦਦ ਕਰੋ। ਅਸੀਂ ਨਿਵੇਸ਼ ਸਲਾਹ ਨਹੀਂ ਦਿੰਦੇ।",
    card_analyze_title: "ਸੁਨੇਹਾ ਜਾਂਚ",
    card_analyze_body: "WhatsApp ਜਾਂ Telegram ਤੇ ਟਿਪ ਆਈ? ਆਮ ਧੋਖਾਧੜੀ ਦੇ ਸੰਕੇਤ ਜਾਂਚੋ।",
    card_verify_title: "ਸਲਾਹਕਾਰ ਜਾਂਚ",
    card_verify_body: "SEBI ਰਜਿਸਟਰਡ ਹੋਣ ਦਾ ਦਾਅਵਾ? ਪੈਸੇ ਭੇਜਣ ਤੋਂ ਪਹਿਲਾਂ ਜਾਂਚੋ।",
    analyze_now: "ਸੁਨੇਹਾ ਵਿਸ਼ਲੇਸ਼ਣ ਕਰੋ",
    verify_now: "ਹੁਣੇ ਜਾਂਚੋ",
    disclaimer_title: "ਸੁਰੱਖਿਆ ਐਲਾਨ",
    disclaimer_body: "NiveshRaksha ਇੱਕ ਸਿੱਖਿਅਕ ਅਤੇ ਸੁਰੱਖਿਆ ਸਾਧਨ ਹੈ। ਅਸੀਂ ਵਿੱਤੀ, ਨਿਵੇਸ਼ ਜਾਂ ਕਾਨੂੰਨੀ ਸਲਾਹ ਨਹੀਂ ਦਿੰਦੇ। 'ਕੋਈ ਲਾਲ ਝੰਡੇ ਨਹੀਂ' ਦਾ ਮਤਲਬ ਨਿਵੇਸ਼ ਸੁਰੱਖਿਅਤ ਹੈ — ਅਜਿਹੀ ਗਾਰੰਟੀ ਨਹੀਂ। SEBI ਵਰਗੀਆਂ ਅਧਿਕਾਰਤ ਸੰਸਥਾਵਾਂ ਤੋਂ ਸੁਤੰਤਰ ਤੌਰ ਤੇ ਜਾਂਚੋ।",
    footer: "NiveshRaksha — ਨਿਵੇਸ਼ਕ ਮਜ਼ਬੂਤੀ ਪਲੇਟਫਾਰਮ। Akash Kishore ਵੱਲੋਂ ਬਣਾਇਆ।",
  },
  as: {
    nav_analyze: "বাৰ্তা পৰীক্ষা",
    nav_verify: "উপদেষ্টা পৰীক্ষা",
    nav_learn: "শিকক",
    nav_pause: "বিৰতি",
    nav_report: "প্ৰমাণ সংগ্ৰহ",
    nav_about: "বিষয়ে",
    language_label: "ভাষা",
    landing_title: "ৰৈ যাওক। সত্যাপন কৰক। সুৰক্ষিত থাকক।",
    landing_sub: "সন্দেহজনক বিত্তীয় বাৰ্তা চিনাক্ত কৰিবলৈ, উপদেষ্টা সত্যাপন কৰিবলৈ আৰু সুৰক্ষিত পদক্ষেপ লবলৈ নিজকে আৰু পৰিয়ালক সহায় কৰক। আমি বিনিয়োগ পৰামৰ্শ নিদিওঁ।",
    card_analyze_title: "বাৰ্তা পৰীক্ষা",
    card_analyze_body: "WhatsApp বা Telegram ত টিপছ আহিছে? সাধাৰণ প্ৰতাৰণাৰ চিন পৰীক্ষা কৰক।",
    card_verify_title: "উপদেষ্টা সত্যাপন",
    card_verify_body: "SEBI পঞ্জীয়নভুক্ত দাবী কৰে? টকা পঠিয়াৰ আগতে সত্যাপন কৰক।",
    analyze_now: "বাৰ্তা বিশ্লেষণ কৰক",
    verify_now: "এতিয়াই সত্যাপন কৰক",
    disclaimer_title: "সুৰক্ষা ঘোষণা",
    disclaimer_body: "NiveshRaksha এখন শিক্ষামূলক আৰু সুৰক্ষা সঁজুলি। আমি বিত্তীয়, বিনিয়োগ বা আইনী পৰামৰ্শ নিদিওঁ। 'কোনো লাল পতাকা নাই' মানে বিনিয়োগ সুৰক্ষিত — এনে নিশ্চয়তা নহয়। SEBI ৰ দৰে আধিকাৰিক অনুষ্ঠানৰ জৰিয়তে স্বাধীনভাৱে সত্যাপন কৰক।",
    footer: "NiveshRaksha — বিনিয়োগকাৰী স্থিতিস্থাপকতা প্লেটফৰ্ম। Akash Kishore ৰ দ্বাৰা নিৰ্মিত।",
  },
} as const;

export type DictKey = keyof (typeof dict)["en"];

const STORAGE_KEY = "nr_language";
const SUPPORTED: Language[] = ["en", "ta", "hi", "te", "ml", "kn", "bn", "mr", "gu", "or", "pa", "as"];

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
