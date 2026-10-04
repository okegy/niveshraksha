"""Synthetic multilingual training/evaluation corpus.

Every sentence is generated from templates + per-language scam lexicons that
this project authored. No real user messages, no scraped chats, no third-party
datasets — safe to train and evaluate on, and honest about its limits: it
measures template-space behaviour, not real-world accuracy (see
docs/MODEL_EVALUATION.md).

Seeded generation keeps the corpus reproducible.
"""
import random

# Per-language scam lexicon pieces (authored by this project).
SCAM_LEXICON: dict[str, dict[str, list[str]]] = {
    "en": {
        "hook": ["Guaranteed 40% monthly return", "Assured daily profit", "Secret tip from an insider"],
        "push": ["Act now, only 2 slots left", "Offer expires today", "Invest before midnight"],
        "credential": ["Share the OTP to activate", "Enter your UPI PIN to receive the refund", "Install AnyDesk for verification"],
        "payment": ["Send money to my GPay", "Transfer the fee to my wallet", "Pay the processing charge to unlock withdrawal"],
        "threat": ["Your KYC expired, account will be frozen", "Account suspended for tax penalty", "Verify KYC now or block"],
        "doc": ["Send PAN and UPI screenshot", "Upload Aadhaar card copy"],
        "benign": [
            "What is the expense ratio of an index fund?",
            "Please share the SEBI investor education page.",
            "I read that SIPs help average out market volatility.",
            "The annual report mentions steady dividend history.",
            "Can we discuss the quarterly results tomorrow?",
        ],
    },
    "ta": {
        "hook": ["உத்தரவாதம் வருவாய் மாதம் 40%", "உறுதியான தினசரி லாபம்"],
        "push": ["இன்று மட்டும், இடங்கள் குறைவு", "இன்றே முதலீடு செய்யுங்கள்"],
        "credential": ["OTP ஐ பகிருங்கள்", "UPI PIN உள்ளிடுங்கள்"],
        "payment": ["எனது GPay க்கு பணம் அனுப்புங்கள்", "கட்டணம் செலுத்தி withdrawal திறக்கவும்"],
        "threat": ["KYC காலாவதியானது, கணக்கு உறைக்கப்படும்"],
        "doc": ["PAN மற்றும் UPI ஸ்கிரீன்ஷாட் அனுப்புங்கள்"],
        "benign": ["குறியீட்டு நிதியின் செலவு விகிதம் என்ன?", "SEBI முதலீட்டாளர் கல்வி பக்கத்தை பகிருங்கள்.", "SIP வரிசை முதலீடு பற்றி கற்றுக்கொள்ளலாம்."],
    },
    "hi": {
        "hook": ["40% मासिक गारंटीड रिटर्न", "रोज़ का पक्का मुनाफ़ा"],
        "push": ["आज ही करें, सीटें कम हैं", "आधी रात से पहले निवेश करें"],
        "credential": ["OTP साझा करें", "रिफंड पाने के लिए UPI PIN डालें"],
        "payment": ["मेरे GPay पर पैसा भेजें", "फीस भेजकर withdrawal खोलें"],
        "threat": ["KYC एक्सपायर, अकाउंट फ्रीज़ होगा"],
        "doc": ["PAN और UPI स्क्रीनशॉट भेजें"],
        "benign": ["इंडेक्स फंड का एक्सपेंस रेशो क्या है?", "SEBI निवेशक शिक्षा पेज साझा करें।", "SIP से बाज़ार का जोखिम घटता है।"],
    },
    "te": {"hook": ["40% నెలవారీ హామీ రాబడి"], "push": ["ఈరోజే చేయండి, సీట్లు తక్కువ"], "credential": ["OTP పంచండి", "UPI PIN నమోదు చేయండి"], "payment": ["నా GPay కి డబ్బు పంపండి"], "threat": ["KYC గడువు ముగిసింది, ఖాతా స్తంభింపజేస్తారు"], "doc": ["PAN మరియు UPI స్క్రీన్‌షాట్ పంపండి"], "benign": ["ఇండెక్స్ ఫండ్ ఖర్చు నిష్పత్తి ఎంత?", "SEBI పెట్టుబడిదారు విద్యా పేజీ పంచండి."]},
    "ml": {"hook": ["40% പ്രതിമാസ ഉറപ്പുള്ള വരുമാനം"], "push": ["ഇന്ന് തന്നെ ചെയ്യൂ, സീറ്റ് കുറവാണ്"], "credential": ["OTP പങ്കിടൂ", "UPI PIN നൽകൂ"], "payment": ["എന്റെ GPay ലേക്ക് പണം അയക്കൂ"], "threat": ["KYC കാലഹരണപ്പെട്ടു, അക്കൗണ്ട് മരവിപ്പിക്കും"], "doc": ["PAN, UPI സ്ക്രീൻഷോട്ട് അയക്കൂ"], "benign": ["ഇൻഡക്സ് ഫണ്ടിന്റെ ചെലവ് നിരക്ക് എത്ര?", "SEBI നിക്ഷേപക വിദ്യാഭ്യാസ പേജ് പങ്കിടൂ."]},
    "kn": {"hook": ["40% ಮಾಸಿಕ ಖಾತರಿ ಆದಾಯ"], "push": ["ಇಂದೇ ಮಾಡಿ, ಸೀಟುಗಳು ಕಡಿಮೆ"], "credential": ["OTP ಹಂಚಿ", "UPI PIN ನಮೂದಿಸಿ"], "payment": ["ನನ್ನ GPay ಗೆ ಹಣ ಕಳುಹಿಸಿ"], "threat": ["KYC ಅವಧಿ ಮುಗಿದಿದೆ, ಖಾತೆ ಸ್ಥಗಿತಗೊಳ್ಳುತ್ತದೆ"], "doc": ["PAN ಮತ್ತು UPI ಸ್ಕ್ರೀನ್‌ಶಾಟ್ ಕಳುಹಿಸಿ"], "benign": ["ಇಂಡೆಕ್ಸ್ ಫಂಡ್ ವೆಚ್ಚದ ಅನುಪಾತ ಎಷ್ಟು?", "SEBI ಹೂಡಿಕೆದಾರ ಶಿಕ್ಷಣ ಪುಟ ಹಂಚಿ."]},
    "bn": {"hook": ["40% মাসিক নিশ্চিত রিটার্ন"], "push": ["আজই করুন, আসন সীমিত"], "credential": ["OTP শেয়ার করুন", "UPI PIN দিন"], "payment": ["আমার GPay-তে টাকা পাঠান"], "threat": ["KYC মেয়াদোত্তীর্ণ, অ্যাকাউন্ট স্থগিত হবে"], "doc": ["PAN ও UPI স্ক্রিনশট পাঠান"], "benign": ["ইনডেক্স ফান্ডের খরচের অনুপাত কত?", "SEBI বিনিয়োগকারী শিক্ষা পৃষ্ঠা শেয়ার করুন।"]},
    "mr": {"hook": ["40% मासिक खात्रीशीर परतावा"], "push": ["आजच करा, जागा कमी"], "credential": ["OTP शेअर करा", "UPI PIN टाका"], "payment": ["माझ्या GPay वर पैसे पाठवा"], "threat": ["KYC मुदत संपली, खाते स्थगित होईल"], "doc": ["PAN आणि UPI स्क्रीनशॉट पाठवा"], "benign": ["इंडेक्स फंडचा खर्च गुणोत्तर किती?", "SEBI गुंतवणूकदार शिक्षण पृष्ठ शेअर करा."]},
    "gu": {"hook": ["40% માસિક ગેરંટી વળતર"], "push": ["આજે જ કરો, સીટ ઓછી"], "credential": ["OTP શેર કરો", "UPI PIN નાખો"], "payment": ["મારા GPay પર પૈસા મોકલો"], "threat": ["KYC સમાપ્ત, ખાતું સ્થગિત થશે"], "doc": ["PAN અને UPI સ્ક્રીનશોટ મોકલો"], "benign": ["ઈન્ડેક્સ ફંડનો ખર્ચ ગુણોત્તર કેટલો?", "SEBI રોકાણકાર શિક્ષણ પેજ શેર કરો."]},
    "or": {"hook": ["40% ମାସିକ ଗାରଣ୍ଟି ରିଟର୍ନ"], "push": ["ଆଜି କରନ୍ତୁ, ଆସନ କମ୍"], "credential": ["OTP ସେୟାର କରନ୍ତୁ", "UPI PIN ଦିଅନ୍ତୁ"], "payment": ["ମୋ GPay କୁ ପଇସା ପଠାନ୍ତୁ"], "threat": ["KYC ଅବଧି ସରିଛି, ଖାତା ସ୍ଥଗିତ ହେବ"], "doc": ["PAN ଓ UPI ସ୍କ୍ରିନସଟ୍ ପଠାନ୍ତୁ"], "benign": ["ଇଣ୍ଡେକ୍ସ ଫଣ୍ଡ ଖର୍ଚ୍ଚ ଅନୁପାତ କେତେ?", "SEBI ବିନିଯୋଗକାରୀ ଶିକ୍ଷା ପୃଷ୍ଠା ସେୟାର କରନ୍ତୁ।"]},
    "pa": {"hook": ["40% ਮਾਸਿਕ ਗਾਰੰਟੀਸ਼ੁਦਾ ਵਾਪਸੀ"], "push": ["ਅੱਜ ਹੀ ਕਰੋ, ਸੀਟਾਂ ਘੱਟ"], "credential": ["OTP ਸਾਂਝਾ ਕਰੋ", "UPI PIN ਪਾਓ"], "payment": ["ਮੇਰੇ GPay ਤੇ ਪੈਸੇ ਭੇਜੋ"], "threat": ["KYC ਮਿਆਦ ਪੁੱਗੀ, ਖਾਤਾ ਰੋਕਿਆ ਜਾਵੇਗਾ"], "doc": ["PAN ਤੇ UPI ਸਕਰੀਨਸ਼ਾਟ ਭੇਜੋ"], "benign": ["ਇੰਡੈਕਸ ਫੰਡ ਦੀ ਖਰਚ ਦਰ ਕਿੰਨੀ ਹੈ?", "SEBI ਨਿਵੇਸ਼ਕ ਸਿੱਖਿਆ ਪੰਨਾ ਸਾਂਝਾ ਕਰੋ।"]},
    "as": {"hook": ["40% মাহিক নিশ্চিত ৰিটাৰ্ন"], "push": ["আজিয়েই কৰক, আসন কম"], "credential": ["OTP শ্বেয়াৰ কৰক", "UPI PIN দিয়ক"], "payment": ["মোৰ GPayলৈ টকা পঠিয়াওক"], "threat": ["KYC ম্যাদ শেষ, একাউণ্ট স্থগিত হব"], "doc": ["PAN আৰু UPI স্ক্ৰীনশট পঠিয়াওক"], "benign": ["ইণ্ডেক্স ফাণ্ডৰ খৰচ অনুপাত কিমান?", "SEBI বিনিয়োগকাৰী শিক্ষা পৃষ্ঠা শ্বেয়াৰ কৰক।"]},
}

_SCAM_KINDS = ["hook", "push", "credential", "payment", "threat", "doc"]


def build_corpus(seed: int = 42, per_language: int = 120) -> list[dict]:
    """Returns [{text, label(0=benign,1=scam), language}] — synthetic only."""
    rng = random.Random(seed)
    rows: list[dict] = []
    for lang, lex in SCAM_LEXICON.items():
        # Scam rows: 1-3 scam components joined.
        for _ in range(per_language):
            kinds = rng.sample(_SCAM_KINDS, k=rng.randint(1, 3))
            parts = [rng.choice(lex[k]) for k in kinds]
            text = ". ".join(parts) + ("!" if rng.random() < 0.5 else "")
            rows.append({"text": text, "label": 1, "language": lang})
        # Benign rows with some noise tokens.
        for _ in range(per_language):
            text = rng.choice(lex["benign"])
            if rng.random() < 0.3:
                text += " " + rng.choice(["2026", "please", "thank you"])
            rows.append({"text": text, "label": 0, "language": lang})
    rng.shuffle(rows)
    return rows


def languages() -> list[str]:
    return list(SCAM_LEXICON.keys())
