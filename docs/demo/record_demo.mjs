/* CLIENT-FACING DEMO RECORDER — NiveshRaksha / SENTINEL-X
 * Records a detailed first-page-to-last walkthrough with:
 *  - Playwright video (1280x800 webm)
 *  - Sarvam TTS narration clips (my "voice") with timeline offsets
 *  - Guide reply TTS clips at key moments (the agents talking)
 * Mux afterwards with mux_demo.py → docs/demo/niveshraksha-demo.mp4
 */
import { chromium } from "@playwright/test";
import fs from "fs";
import path from "path";

const APP = "http://localhost:3000";
const BACKEND = "http://localhost:8000";
const OUT = "D:/sangyam hackathon/docs/demo";
const SAMPLES = "D:/sangyam hackathon/workspace/niveshraksha/samples";
fs.mkdirSync(OUT, { recursive: true });

const timeline = [];
const t0 = Date.now();
const at = (label, kind) => {
  timeline.push({ label, kind, offset_ms: Date.now() - t0 });
  console.log(`[${((Date.now() - t0) / 1000).toFixed(0)}s] ${label}`);
};

async function tts(text, tag, lang = "en-IN") {
  try {
    const res = await fetch(`${BACKEND}/api/v1/voice/speak`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: text.slice(0, 850), language: lang }),
    });
    if (!res.ok) throw new Error(String(res.status));
    const buf = Buffer.from(await res.arrayBuffer());
    const file = path.join(OUT, `tts-${tag}.wav`);
    fs.writeFileSync(file, buf);
    at(`TTS ${tag} (${Math.round(buf.length / 1024)}KB)`, "audio");
  } catch (e) {
    at(`TTS FAILED ${tag}: ${String(e).slice(0, 60)}`, "audio-error");
  }
}

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1280, height: 800 },
  recordVideo: { dir: OUT, size: { width: 1280, height: 800 } },
});
const page = await context.newPage();
page.setDefaultTimeout(20000);

const domClick = (match) =>
  page.evaluate((m) => {
    const b = Array.from(document.querySelectorAll("button")).find((x) =>
      typeof m === "string" ? x.textContent?.trim() === m : m.test(x.textContent || ""));
    b?.click();
  }, match);

const typeInto = async (sel, text) => {
  await page.locator(sel).click();
  await page.fill(sel, text);
};

async function speakReply(limit = 420) {
  const text = await page.evaluate(() => {
    const nodes = Array.from(document.querySelectorAll("main .rounded-xl, [role='dialog'] .rounded-xl"));
    const guide = nodes.filter((n) => !n.className.includes("rounded-br-sm"));
    return guide.length ? guide[guide.length - 1].innerText.slice(0, limit) : "";
  }).catch(() => "");
  if (text) await tts(text, `guide-${Date.now() - t0}`);
}

try {
  at("video start", "video");

  // ============ 1. LANDING ============
  await page.goto(APP, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3500);
  await tts("Hello, and welcome to SENTINEL-X — an investor safety platform I built to protect people from online financial fraud. Over the next few minutes I'll show you every feature, exactly the way a real user would use it.", "narr-1");
  await page.mouse.wheel(0, 500); await page.waitForTimeout(2200);
  await page.mouse.wheel(0, 700); await page.waitForTimeout(2200);
  await page.mouse.wheel(0, -1200); await page.waitForTimeout(1500);
  at("landing tour done", "step");

  // ============ 2. WIDGET ============
  await tts("First — help is available on every single page. This floating assistant knows which page you're on. Let me ask it what this portal can do.", "narr-2");
  await domClick((t) => t.startsWith("Open the Raksha Guide helper"));
  await page.waitForTimeout(900);
  await domClick("What can I scan here?");
  await page.waitForTimeout(3500);
  await page.evaluate(() => document.querySelector('button[aria-label="Close helper"]')?.click());
  await page.waitForTimeout(500);
  at("widget demo", "step");

  // ============ 3. HERO SCAN — phishing URL ============
  await tts("I just received this link on WhatsApp claiming my KYC needs updating. Let me paste it into the scanner.");
  await typeInto('input[aria-label="Query to verify"]', "http://sebi.kyc-update.xyz/verify-account");
  await page.waitForTimeout(400);
  await domClick("SCAN");
  await page.waitForTimeout(3000);
  await tts("Immediately flagged as critical — fake domain patterns, no encryption, and a regulator name used in the address. And notice: it shows exactly which words triggered each warning.");
  await page.mouse.wheel(0, 400); await page.waitForTimeout(2500);
  await page.mouse.wheel(0, 400); await page.waitForTimeout(2000);
  at("hero scan: URL = CRITICAL", "step");

  // ============ 4. CRYPTO + EMAIL scans ============
  await typeInto('input[aria-label="Query to verify"]', "0x71C7656EC7ab88b098defB751B7401B5f6d89739");
  await domClick("SCAN");
  await page.waitForTimeout(2800);
  await tts("Crypto wallet addresses too — it validates the format and gives drainer-awareness guidance, because crypto payments are irreversible.");
  await page.waitForTimeout(1500);
  await typeInto('input[aria-label="Query to verify"]', "support-ticket-update@mail-security-check.com");
  await domClick("SCAN");
  await page.waitForTimeout(2800);
  await tts("And fake email addresses — this one uses a phishing-shaped domain.");
  await page.waitForTimeout(1200);
  at("crypto + email scans", "step");

  // ============ 5. REPORT FRAUD MODAL ============
  await tts("See something suspicious? Report it right from the top bar — and the engine scores your report instantly.");
  await domClick("Report Fraud");
  await page.waitForTimeout(800);
  await typeInto("#rep-target", "http://fake-sbi-kyc-approval.xyz");
  await typeInto("#rep-details", "callers claim KYC is frozen and demand a fee to unlock withdrawal, promised guaranteed returns");
  await page.waitForTimeout(400);
  await domClick("SUBMIT REPORT");
  await page.waitForTimeout(3000);
  await page.evaluate(() => document.querySelector('button[aria-label="Close report dialog"], [role="dialog"] button')?.click());
  await page.waitForTimeout(800);
  at("fraud modal submitted", "step");

  // ============ 6. /analyze MESSAGE ============
  await tts("Now the heart of the platform — the full analyzer. Let me paste the entire scam message I received.");
  await page.goto(`${APP}/analyze`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);
  await typeInto("#message-input",
    "Congratulations! You are selected for our exclusive investment group. Guaranteed 40% monthly return. Only 3 slots left — invest today. Send the amount to my GPay and share the OTP to confirm registration. SEBI-approved advisory.");
  await domClick("Analyze Message");
  await page.waitForTimeout(3500);
  await tts("High risk — six warning signs. For every single one it shows the exact words that triggered it, why it matters, and what it could not verify. It even runs an assistive machine-learning model — but the rules alone always decide, so there's no black box.");
  await page.mouse.wheel(0, 600); await page.waitForTimeout(2200);
  await page.mouse.wheel(0, 600); await page.waitForTimeout(2200);
  await page.mouse.wheel(0, 600); await page.waitForTimeout(2200);
  await page.mouse.wheel(0, 600); await page.waitForTimeout(2000);
  at("analyze message: full result", "step");

  // ============ 7. /analyze URL TAB ============
  await page.click('button:has-text("URL")');
  await page.waitForTimeout(500);
  await typeInto('textarea[aria-label="URL to analyze"]', "http://sbi-secure-login.top/kyc");
  await domClick("Check URL");
  await page.waitForTimeout(3000);
  await tts("Links get the same treatment — this fake banking domain is flagged instantly. And the app never actually opens the link, so scanning is completely safe.");
  await page.waitForTimeout(1200);
  at("analyze URL tab", "step");

  // ============ 8. /analyze SCREENSHOT OCR ============
  await page.click('button:has-text("Screenshot")');
  await page.waitForTimeout(600);
  await tts("Screenshots are the most common way scam proof is shared. Watch this — I'll upload a Telegram tip-group screenshot, and an on-device OCR engine reads it. Nothing is uploaded to any cloud.");
  await page.setInputFiles('input[type="file"]', path.join(SAMPLES, "ocr-telegram-tip.png"));
  await page.waitForTimeout(16000);
  await tts("It extracted every word and flagged five scam indicators — high risk. The image was processed in memory and discarded.");
  await page.waitForTimeout(1500);
  at("screenshot OCR demo", "step");

  // ============ 9. /verify ============
  await tts("Next — advisor verification. Anyone giving paid investment advice in India must be SEBI registered. Let me check the number they gave me.");
  await page.goto(`${APP}/verify`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);
  await domClick("Try an example");
  await domClick("Verify credentials");
  await page.waitForTimeout(4000);
  await tts("The number matched the bundled records — and the app immediately tells me to confirm on the official SEBI website myself. It never says trust me.");
  await page.waitForTimeout(1200);
  await typeInto("#regNo", "INA999999999");
  await domClick("Verify credentials");
  await page.waitForTimeout(4000);
  await tts("And an unknown number gives an honest result — it could not verify, which is not the same as fraudulent. That honesty is a core design principle.");
  at("verify both states", "step");

  // ============ 10. /chat conversational ============
  await tts("Now my favorite part — the Raksha Guide. An AI assistant with real tools, available on every page. Let me tell it my story the way I'd tell a friend.");
  await page.goto(`${APP}/chat`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);
  const story = "I'm honestly a bit scared right now. Someone in a Telegram group promised 40 percent monthly returns, showed profit screenshots, and asked for my PAN and an OTP to reserve a slot. I haven't paid yet. What should I do?";
  await typeInto('textarea[aria-label="Ask the Raksha Guide"]', story);
  await page.press('textarea[aria-label="Ask the Raksha Guide"]', "Enter");
  await page.waitForTimeout(6500);
  await tts("It ran its scam analyzer on my story, flagged the patterns, and gave me calm, practical steps. And it speaks — let me play it.");
  await speakReply();
  await page.click('button[aria-label="Read this reply aloud"]').catch(() => {});
  await page.waitForTimeout(4000);
  at("chat: story + tool", "step");

  await tts("Let me ask the follow-up everyone asks too late.");
  await typeInto('textarea[aria-label="Ask the Raksha Guide"]', "Okay but what if I had already sent the money? What do I do first?");
  await page.press('textarea[aria-label="Ask the Raksha Guide"]', "Enter");
  await page.waitForTimeout(5500);
  await tts("Call 1930 and report at cybercrime.gov.in within the golden hour. Now let me try to trick it into giving me stock advice.");
  await speakReply();

  await typeInto('textarea[aria-label="Ask the Raksha Guide"]', "Fine — but which crypto is going to 10x this week?");
  await page.press('textarea[aria-label="Ask the Raksha Guide"]', "Enter");
  await page.waitForTimeout(5000);
  await tts("Refused — out of scope. It will never recommend investments, never predict prices. That boundary is tested by automated tests on every build.");
  await speakReply();
  at("chat: golden hour + refusal", "step");

  // ============ 11. /pause ============
  await tts("Scams work by creating urgency. So before anything else, the platform makes you pause — thirty seconds, three honest questions, and the Guide walks through them with you.");
  await page.goto(`${APP}/pause`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);
  await page.click('input[aria-label="Am I feeling rushed?"]');
  await page.waitForTimeout(2200);
  await page.click('input[aria-label="Have I verified the source independently?"]');
  await page.waitForTimeout(2200);
  await page.click('input[aria-label="Are they asking for credentials?"]');
  await page.waitForTimeout(2500);
  at("pause interactive", "step");

  // ============ 12. /report ============
  await tts("And if the worst happens — the Evidence Locker prepares a redacted incident draft for official reporting. Watch the live redaction as I type my phone number and PAN.");
  await page.goto(`${APP}/report`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);
  await typeInto("#content", "The scammer called 9876543210 and asked for PAN ABCDE1234F and an OTP to unlock withdrawal.");
  await page.waitForTimeout(2200);
  await tts("Phone number and PAN redacted in real time — before anything is stored. Nothing is saved unless I give explicit consent, and everything auto-deletes in seventy-two hours.");
  await page.click('button:has-text("Create draft")');
  await page.waitForTimeout(3000);
  await page.mouse.wheel(0, 400); await page.waitForTimeout(1800);
  at("report redaction", "step");

  // ============ 13. /learn + language ============
  await tts("Prevention matters most — so there's an education hub with seven lessons, in twelve Indian languages. Let me switch to Hindi.");
  await page.goto(`${APP}/learn`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);
  await page.selectOption("#lang-select", "hi");
  await page.waitForTimeout(3000);
  await tts("The entire platform — interface, lessons, voice — switches language instantly.");
  await page.selectOption("#lang-select", "en");
  await page.waitForTimeout(1500);
  at("learn + hindi", "step");

  // ============ 14. /settings ============
  await tts("Users can personalise everything — color themes, avatars, voice replies, and a private chat history that's encrypted with a key only your browser holds.");
  await page.goto(`${APP}/settings`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);
  await domClick("Indigo");
  await page.waitForTimeout(1200);
  await domClick("Emerald");
  await page.waitForTimeout(1200);
  await domClick((t) => t.includes("Owl"));
  await page.waitForTimeout(1200);
  at("settings demo", "step");

  // ============ 15. /about ============
  await tts("And because trust is the product, the About page shows exactly how the engine decides, where every source comes from, and all the limitations — plainly.");
  await page.goto(`${APP}/about`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);
  await page.mouse.wheel(0, 700); await page.waitForTimeout(1800);
  await page.mouse.wheel(0, 700); await page.waitForTimeout(1800);
  at("about", "step");

  // ============ 16. END ============
  await page.goto(APP, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2500);
  await tts("That's SENTINEL-X — scan, chat, verify, pause, report, and learn, in twelve languages, privacy-first, with honest answers every time. Remember the habit: Pause. Verify. Protect. Thank you.", "narr-end");
  await page.waitForTimeout(2500);
  at("end", "step");
} catch (e) {
  at(`ERROR: ${String(e).slice(0, 300)}`, "error");
  console.error("WALKTHROUGH ERROR:", e);
}

await page.waitForTimeout(2000);
const video = page.video();
await context.close();
const videoPath = await video?.path();
if (videoPath) {
  const dest = path.join(OUT, "niveshraksha-demo-raw.webm");
  fs.renameSync(videoPath, dest);
  console.log("VIDEO:", dest);
}
fs.writeFileSync(path.join(OUT, "timeline.json"), JSON.stringify(timeline, null, 2));
const durS = ((Date.now() - t0) / 1000).toFixed(1);
console.log("TIMELINE events:", timeline.length, "| duration s:", durS);
await browser.close();
