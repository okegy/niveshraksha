"""Deterministic, explainable scam red-flag rules.

Critical warnings are decided ONLY by these deterministic rules — never by an
LLM. Each rule is a plain regex with a fixed human explanation so every result
is auditable. Patterns are heuristics: a match is a *potential warning sign*,
not proof of fraud.
"""
import re

from ..models import RedFlag, RiskLevel

# Each rule: code, label, regex, plain-language explanation, severity.
RULES = [
    {
        "code": "GUARANTEED_RETURN",
        "label": "Guaranteed-return claim",
        "pattern": r"(guaranteed|assured|guarantee|உத்தரவாதம்)\s*(?:\w+\s+){0,3}?(\d+\s*%|returns?|profit|வருவாய்|லாபம்)",
        "explanation": "The message promises fixed or guaranteed returns. No genuine investment can guarantee returns, and regulators warn that this is a common scam tactic.",
        "severity": "high",
    },
    {
        "code": "UNUSUALLY_HIGH_RETURN",
        "label": "Unusually high return figure",
        "pattern": r"(\d{2,}\s*%)\s*(return|profit|gain|per\s*(month|day|week)|monthly|daily|வருமானம்)",
        "explanation": "The message quotes a very large fixed percentage return. Returns at this level are typical of fraudulent schemes, not regulated investments.",
        "severity": "high",
    },
    {
        "code": "URGENCY_PRESSURE",
        "label": "Urgent payment pressure",
        "pattern": r"(act now|hurry|last chance|today only|expire[sd]? (?:today|tomorrow)|don'?t (?:delay|miss)|(?:invest|join|register|sign\s*up|enroll)\s+today|இன்று மட்டும்|அவசரம்)",
        "explanation": "Scammers create false urgency so you decide before you can verify. Take the time to check everything independently.",
        "severity": "high",
    },
    {
        "code": "LIMITED_SLOTS_SECRET_TIP",
        "label": "\"Limited slot\" or \"secret tip\" language",
        "pattern": r"(limited (?:slots?|seats?|time)|secret tip|insider (?:tip|info)|exclusive (?:tip|offer)|ரகசிய தகவல்)",
        "explanation": "\"Limited slots\" and \"secret tips\" are classic pressure tactics used in pump-and-dump and Telegram tip scams.",
        "severity": "medium",
    },
    {
        "code": "IMPERSONATION",
        "label": "Claims a regulator approved a scheme or platform",
        "pattern": r"(sebi|rbi|rera|irdai|r\.b\.i\.|s\.e\.b\.i\.|hdfc|sbi|icici|axis bank|lic)[-\s]+(?:\w+[-\s]+){0,2}(?:approved|verified|authorized|authorised|certified|recognized|recognised)",
        "explanation": "The message claims approval from a regulator or bank. Regulators do not approve individual schemes, apps, or returns. Verify any such claim directly on the official website — never through links or numbers in the message. (Claims of being a 'registered advisor' are checked separately — verify the registration number yourself.)",
        "severity": "high",
    },
    {
        "code": "ASKING_CREDENTIALS",
        "label": "Requests OTP, PIN, password, or remote access",
        "pattern": r"\b(?:share|send|enter|give|provide|confirm|type|forward)\s+(?:\w+\s+){0,2}?(?:otp|upi\s*pin|pin|password|passcode|cvv|cv2|credentials|one\s*time\s*password)\b|\b(?:anydesk|teamviewer|quick\s*support|remote\s*(?:access|control|desktop))\b",
        "explanation": "The message asks for an OTP, UPI PIN, password, or remote access to your device. No genuine bank, broker, or regulator will ever ask for these. Sharing them can lead to immediate loss of money.",
        "severity": "high",
    },
    {
        "code": "PERSONAL_ACCOUNT_PAYMENT",
        "label": "Payment to a personal account or unknown wallet",
        "pattern": r"(send|transfer|pay)\s*(?:\w+\s+){0,3}(?:to\s+)?(my|his|her|their|personal|gpay|google\s*pay|phonepe|paytm|upi|wallet|btc|usdt|crypto)",
        "explanation": "The message asks you to pay into a personal account, wallet app, or crypto wallet. Regulated firms collect money only through accounts in the firm's own verified name.",
        "severity": "high",
    },
    {
        "code": "UNREGISTERED_ADVISOR_CLAIM",
        "label": "Unverifiable advisor claim",
        "pattern": r"(?:i\s*am|we\s*are|as\s*an?)\s*(?:a\s*)?(?:sebi\s*)?(?:registered|certified)\s*(?:investment\s*)?(?:advisor|adviser|analyst|expert)",
        "explanation": "The sender claims to be a registered advisor. Anyone giving investment advice for money must be SEBI-registered. A claim in a message is not proof — verify the registration number yourself on the official SEBI website.",
        "severity": "medium",
    },
    {
        "code": "FAKE_APPROVAL_ARTIFACT",
        "label": "Certificate / approval claim without proof",
        "pattern": r"(certificate|license|licence|registration\s*(?:copy|proof)|approval\s*letter)\s*(?:attached| enclosed| copied|screenshot)?",
        "explanation": "The message mentions or attaches a certificate as proof of legitimacy. Certificates and screenshots are easily forged — verify through the regulator's official database instead.",
        "severity": "medium",
    },
    {
        "code": "PROFIT_SCREENSHOT_PROOF",
        "label": "Profit screenshots offered as proof",
        "pattern": r"(profit|earning|payout)\s*(?:screenshot|proof|image)",
        "explanation": "Screenshots of profits are commonly faked or cherry-picked. They are not evidence that an investment is genuine.",
        "severity": "low",
    },
    {
        "code": "FEE_TO_UNLOCK_WITHDRAWAL",
        "label": "Fee demanded to unlock withdrawals or allocations",
        "pattern": r"(?:pay|transfer|deposit|send)\s+(?:\w+\s+){0,3}?(?:fee|charge|tax|amount)\s+(?:\w+\s+){0,2}?(?:to\s+)?(?:unlock|release|withdraw|unfreeze|allocate)|unlock\s+(?:the\s+)?(?:withdrawal|funds|allocation|ipo)|allocation\s+(?:fee|charge)|release\s+(?:your\s+)?funds?|unlockwithdrawals|chargetounlock|feetounlock",
        "explanation": "The message demands a payment before money you are owed can be 'unlocked' or an allocation released. Genuine firms never ask for advance fees to release your own funds or allotments — this is the classic advance-fee scam pattern.",
        "severity": "high",
    },
    {
        "code": "FAKE_KYC_ACCOUNT_THREAT",
        "label": "Fake KYC, account-freeze, tax, or penalty threat",
        "pattern": r"(?:kyc|account|demat|pan\s*card?)\s*(?:expired|suspended|frozen|blocked|invalid|on\s*hold)|account\s+(?:will\s+be\s+)?(?:freez|block|suspend)\w*|(?:income\s*)?tax\s+(?:penalty|due|raid)|penalty\s+(?:of|for)\s+|immediate(?:ly)?\s+(?:suspend|freeze|block)|verify\s+(?:your\s+)?kyc\s+(?:within|before|now)|kychasexpired|accountwillbe\w*froz\w*|willbefroz\w*",
        "explanation": "The message threatens to freeze or suspend your account, or claims a KYC/tax problem that must be fixed immediately. Banks and regulators do not threaten you over links in messages. Contact the institution directly using the number on its official website.",
        "severity": "high",
    },
    {
        "code": "SENSITIVE_DOCUMENT_REQUEST",
        "label": "Requests PAN, Aadhaar, or identity documents",
        "pattern": r"(?:send|share|upload|whatsapp|submit)\s+(?:\w+\s+){0,3}?(?:pan|aadhaar|aadhar|passport|voter\s*id|identity)\s*(?:card|number|screenshot|photo|copy)?|(?:pan|aadhaar|aadhar)\s*(?:card|number)?\s*(?:and|&|\+)\s*(?:upi\s*)?screenshot",
        "explanation": "The message asks for identity documents such as PAN or Aadhaar. Combined with payment requests, this is used for identity theft and fraudulent account opening. Share documents only through official, verified channels — never in a chat.",
        "severity": "high",
    },
    {
        "code": "IPO_ALLOCATION_PROMISE",
        "label": "Promised IPO or allotment access",
        "pattern": r"(?:ipo|allotment|allocation|pre[-\s]?ipo)\s+(?:is\s+)?(?:guaranteed|assured|reserved|confirmed|available\s+for\s+you)|guaranteed\s+(?:ipo|allotment)",
        "explanation": "The message promises guaranteed IPO allotment or reserved allocations. IPO allotment is a regulated, lottery-based process — nobody can guarantee one, and 'pre-IPO allocations' offered in chat groups are a common fraud.",
        "severity": "high",
    },
]

# Authored multilingual phrase rules. The English/Tamil structured patterns
# above generalise; these phrase lists carry the remaining languages. They come
# from the same per-language lexicons used by the ML corpus (app/ml/corpus.py),
# and a language is only listed here once its evaluation set passes.
EXTRA_PHRASES: list[dict[str, str | list[str]]] = [
    {
        "code": "URGENCY_PRESSURE",
        "phrases": ["இன்றே செய்யுங்கள்", "நாளைக்கு முடிந்துவிடும்"],
    },
    {
        "code": "GUARANTEED_RETURN",
        "phrases": ["உத்தரவாதம்", "உறுதியான வருவாய்"],
    },
]

# Kinds from app/ml/corpus.py map to rule codes so every supported language's
# lexicon becomes deterministic, auditable phrase rules.
_KIND_TO_CODE = {
    "hook": "GUARANTEED_RETURN",
    "push": "URGENCY_PRESSURE",
    "credential": "ASKING_CREDENTIALS",
    "payment": "PERSONAL_ACCOUNT_PAYMENT",
    "threat": "FAKE_KYC_ACCOUNT_THREAT",
    "doc": "SENSITIVE_DOCUMENT_REQUEST",
}

# Only extend from languages whose structured rules can't already cover them.
_LANGUAGES_NEEDING_PHRASES = {"ta", "hi", "te", "ml", "kn", "bn", "mr", "gu", "or", "pa", "as"}


def _extend_phrases_from_lexicon() -> None:
    from ..ml.corpus import SCAM_LEXICON

    by_code: dict[str, list[str]] = {}
    for lang in _LANGUAGES_NEEDING_PHRASES:
        lex = SCAM_LEXICON.get(lang)
        if not lex:
            continue
        for kind, code in _KIND_TO_CODE.items():
            for phrase in lex.get(kind, []):
                if phrase not in by_code.setdefault(code, []):
                    by_code[code].append(phrase)
    for code, phrases in by_code.items():
        existing = next((e for e in EXTRA_PHRASES if e["code"] == code), None)
        if existing is None:
            EXTRA_PHRASES.append({"code": code, "phrases": phrases})
        else:
            merged = existing["phrases"]
            merged = merged + [p for p in phrases if p not in merged]  # type: ignore[operator]
            existing["phrases"] = merged


_extend_phrases_from_lexicon()

_COMPILED = [(r, re.compile(r["pattern"], re.IGNORECASE)) for r in RULES]


class ScamAnalyzer:
    """Deterministic text analyzer. Detection is separated from decision-making:
    it returns the evidence (flags); the risk-tier policy below is the only
    place a level is assigned."""

    def analyze_text(self, text: str) -> list[RedFlag]:
        flags: list[RedFlag] = []
        seen_spans: set[tuple[int, int]] = set()
        spans_by_code: dict[str, list[tuple[int, int]]] = {}
        for rule, compiled in _COMPILED:
            for match in compiled.finditer(text):
                span = match.span()
                if span in seen_spans:
                    continue
                seen_spans.add(span)
                spans_by_code.setdefault(rule["code"], []).append(span)
                flags.append(
                    RedFlag(
                        code=rule["code"],
                        label=rule["label"],
                        explanation=rule["explanation"],
                        matched_text=match.group(0),
                        severity=rule["severity"],
                    )
                )
        for extra in EXTRA_PHRASES:
            for phrase in extra["phrases"]:
                idx = text.find(phrase)
                if idx == -1:
                    continue
                span = (idx, idx + len(phrase))
                if span in seen_spans:
                    continue
                # Skip if a structured rule already flagged this code on an
                # overlapping span — one hit should yield one flag.
                code = extra["code"]
                assert isinstance(code, str)
                if any(
                    not (span[1] <= s[0] or span[0] >= s[1])
                    for s in spans_by_code.get(code, [])
                ):
                    continue
                seen_spans.add(span)
                base = next(r for r in RULES if r["code"] == extra["code"])
                flags.append(
                    RedFlag(
                        code=base["code"],
                        label=base["label"],
                        explanation=base["explanation"],
                        matched_text=phrase,
                        severity=base["severity"],
                    )
                )
        return flags

    @staticmethod
    def risk_tier(flags: list[RedFlag]) -> RiskLevel:
        """Policy: any high-severity flag -> high; only medium/low -> review
        carefully; nothing -> no obvious red flags. Never claim certainty in
        either direction."""
        if any(f.severity == "high" for f in flags):
            return RiskLevel.high
        if flags:
            return RiskLevel.review_carefully
        return RiskLevel.no_obvious_red_flags

    @staticmethod
    def summary_for(risk_level: RiskLevel) -> str:
        return {
            RiskLevel.high: "This message contains several warning signs commonly associated with investment scams. Do not send money or share sensitive information.",
            RiskLevel.review_carefully: "This message shows some potential warning signs. Review it carefully and verify every claim through an official source before acting.",
            RiskLevel.no_obvious_red_flags: "No obvious red flags were found by our rule-based check. This does NOT prove the message is safe or genuine — always verify independently.",
        }[risk_level]
