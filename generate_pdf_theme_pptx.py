import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE

# Theme Colors based on the provided PDF
PURPLE_DARK = RGBColor(79, 58, 101)  # Bottom bar
PURPLE_LIGHT = RGBColor(145, 131, 166) # Icon circle
TEXT_DARK = RGBColor(30, 30, 30)
ORANGE = RGBColor(235, 123, 44)
GREEN = RGBColor(83, 166, 83)
WHITE = RGBColor(255, 255, 255)
LIGHT_BG = RGBColor(245, 245, 245)
BORDER_GRAY = RGBColor(200, 200, 200)

def add_header_and_footer(slide, prs, title_text, slide_num):
    # Bottom purple bar
    left = top = 0
    width = prs.slide_width
    height = Inches(0.5)
    bottom_bar = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, left, prs.slide_height - height, width, height)
    bottom_bar.fill.solid()
    bottom_bar.fill.fore_color.rgb = PURPLE_DARK
    bottom_bar.line.fill.background() # No line
    
    # Slide number
    txBox = slide.shapes.add_textbox(prs.slide_width - Inches(0.7), prs.slide_height - Inches(0.45), Inches(0.5), Inches(0.4))
    tf = txBox.text_frame
    p = tf.add_paragraph()
    p.text = str(slide_num)
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = TEXT_DARK # Number is outside the bar? In the PDF it's actually above the bar on the right. Wait, in the PDF the number is in the bottom right, on the white part (slide 1) or on the purple bar (slide 2)? Slide 1: number is on white. Slide 2: number is on the purple bar. Let's put it on the purple bar and make it white.
    p.font.color.rgb = TEXT_DARK if slide_num == 1 else WHITE

    if title_text:
        # Title Line
        line = slide.shapes.add_connector(1, Inches(0), Inches(1.5), prs.slide_width, Inches(1.5))
        line.line.color.rgb = BORDER_GRAY
        
        # Circle Icon Background
        circle = slide.shapes.add_shape(MSO_SHAPE.OVAL, Inches(1), Inches(1.1), Inches(0.8), Inches(0.8))
        circle.fill.solid()
        circle.fill.fore_color.rgb = PURPLE_LIGHT
        circle.line.fill.background()
        
        # Title Text
        txBox_title = slide.shapes.add_textbox(Inches(2), Inches(1.2), Inches(8), Inches(0.8))
        tf_title = txBox_title.text_frame
        p_title = tf_title.add_paragraph()
        p_title.text = title_text
        p_title.font.size = Pt(32)
        p_title.font.bold = True
        p_title.font.color.rgb = TEXT_DARK

def add_text_box(slide, text, left, top, width, height, font_size=18, bold=False, color=TEXT_DARK, align=PP_ALIGN.LEFT):
    txBox = slide.shapes.add_textbox(left, top, width, height)
    tf = txBox.text_frame
    tf.word_wrap = True
    p = tf.add_paragraph()
    p.text = text
    p.font.size = Pt(font_size)
    p.font.bold = bold
    p.font.color.rgb = color
    p.alignment = align
    return txBox

def create_presentation(filename="SANGYAN_NiveshRaksha_Theme.pptx"):
    prs = Presentation()
    prs.slide_width = Inches(13.33)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]
    
    # ---------------------------------------------------------
    # Slide 1: Cover
    # ---------------------------------------------------------
    slide = prs.slides.add_slide(blank_layout)
    # Title
    add_text_box(slide, "[Team Name]", Inches(1.5), Inches(1), Inches(10), Inches(1), font_size=54, bold=True)
    # Divider
    line = slide.shapes.add_connector(1, Inches(0), Inches(2), prs.slide_width, Inches(2))
    line.line.color.rgb = BORDER_GRAY
    
    content = (
        "Team Leader Name: [Leader Name]\n"
        "Team Leader Mobile Number: [Mobile Number]\n"
        "Team Leader Email: [Email]\n"
        "No. of Team Members: [Number]\n"
        "Mentor Name (if any): [Mentor Name]\n"
        "Members: [Member Names]\n"
        "College: [College Name]\n\n"
        "Project: NiveshRaksha - Privacy-First Safety Platform for Retail Investors"
    )
    add_text_box(slide, content, Inches(1.5), Inches(2.5), Inches(10), Inches(4), font_size=24)
    add_header_and_footer(slide, prs, None, 1)

    # ---------------------------------------------------------
    # Slide 2: Domain and Problem Statement
    # ---------------------------------------------------------
    slide = prs.slides.add_slide(blank_layout)
    add_header_and_footer(slide, prs, "Domain and Problem Statement", 2)
    
    content_top = (
        "Digital Fraud and Scam Resilience. First-time retail investors are targeted by sophisticated scams using "
        "guaranteed returns, urgency, and SEBI impersonation on WhatsApp/Telegram. Existing platforms focus on trading, "
        "lacking a safe space to verify claims without judgement."
    )
    add_text_box(slide, content_top, Inches(1.5), Inches(2), Inches(10.5), Inches(1), font_size=20)
    
    # Left list
    left_content = (
        "VULNERABILITY\n"
        "First-time investors targeted via messaging apps.\n\n"
        "TACTICS\n"
        "Scammers use urgency, guaranteed returns, and fake IDs.\n\n"
        "LACK OF VERIFICATION\n"
        "No easy way to check claims before losing money.\n\n"
        "REGIONAL BARRIER\n"
        "Most safety content is in English jargon."
    )
    add_text_box(slide, left_content, Inches(1), Inches(3.5), Inches(5), Inches(3), font_size=16)
    
    # Right box (like the stat box in PDF)
    shape = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(6.5), Inches(3.5), Inches(6), Inches(2.5))
    shape.fill.solid()
    shape.fill.fore_color.rgb = LIGHT_BG
    shape.line.color.rgb = PURPLE_DARK
    shape.line.width = Pt(2)
    
    txBox = slide.shapes.add_textbox(Inches(6.6), Inches(3.6), Inches(5.8), Inches(1))
    tf = txBox.text_frame
    p = tf.add_paragraph()
    p.text = "14,209 Scams Flagged"
    p.font.size = Pt(36)
    p.font.bold = True
    p.font.color.rgb = PURPLE_DARK
    
    add_text_box(slide, "A single bad decision can wipe out savings.", Inches(6.6), Inches(4.5), Inches(5.8), Inches(0.5), font_size=16)

    # ---------------------------------------------------------
    # Slide 3: Idea/Solution
    # ---------------------------------------------------------
    slide = prs.slides.add_slide(blank_layout)
    add_header_and_footer(slide, prs, "Idea/Solution", 3)
    
    content_top = (
        "NiveshRaksha provides a privacy-first platform that helps investors identify red flags before they lose money. "
        "It uses deterministic rules to detect urgency and unrealistic guarantees without opaque AI hallucinations."
    )
    add_text_box(slide, content_top, Inches(1.5), Inches(2), Inches(10.5), Inches(1), font_size=20)
    
    # Table like structure
    left_content = (
        "✓ Analyzes messages for urgency, guaranteed returns, credentials.\n\n"
        "✓ Verifies advisors against official (mock) records.\n\n"
        "✓ Provides a 30-Second Pause checklist to break psychology.\n\n"
        "✓ Delivers localized Education Hub (English, Tamil, etc.).\n\n"
        "✓ Ensures privacy: local PII redaction, no raw data hoarding."
    )
    add_text_box(slide, left_content, Inches(1), Inches(3.5), Inches(5.5), Inches(3), font_size=16)
    
    shape = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(7), Inches(3.5), Inches(5.5), Inches(3))
    shape.fill.solid()
    shape.fill.fore_color.rgb = LIGHT_BG
    shape.line.color.rgb = PURPLE_DARK
    
    table_content = (
        "TRADITIONAL VS NIVESHRAKSHA\n\n"
        "Metric       Traditional         NiveshRaksha\n"
        "Detection    Guesswork           Explainable rules\n"
        "Privacy      Data hoarding       Local Redaction\n"
        "Action       Panic/Loss          Safe Next Steps\n"
        "Language     English only        Multilingual (6+)"
    )
    add_text_box(slide, table_content, Inches(7.2), Inches(3.7), Inches(5), Inches(2.5), font_size=14)

    # ---------------------------------------------------------
    # Slide 4: Existing Vs Proposed System
    # ---------------------------------------------------------
    slide = prs.slides.add_slide(blank_layout)
    add_header_and_footer(slide, prs, "Existing Vs Proposed System", 4)
    
    content_top = (
        "Traditional safety tools are either complex compliance portals for institutions or generic advice. "
        "NiveshRaksha acts exactly at the moment of panic with explainable, deterministic detection."
    )
    add_text_box(slide, content_top, Inches(1.5), Inches(2), Inches(10.5), Inches(1), font_size=20)
    
    # Existing Box
    shape_ex = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(1), Inches(3.5), Inches(5.5), Inches(2.5))
    shape_ex.fill.solid()
    shape_ex.fill.fore_color.rgb = RGBColor(255, 245, 245)
    shape_ex.line.color.rgb = RGBColor(200, 100, 100)
    add_text_box(slide, "EXISTING · TODAY\n\n✕ Focuses on trading, not safety\n✕ Black-box ML models hallucinate risk\n✕ Requires PII to sign up\n✕ English only, alienating Bharat", Inches(1.2), Inches(3.7), Inches(5.1), Inches(2), font_size=16, color=RGBColor(150, 50, 50))

    # Proposed Box
    shape_pr = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(6.8), Inches(3.5), Inches(5.5), Inches(2.5))
    shape_pr.fill.solid()
    shape_pr.fill.fore_color.rgb = RGBColor(245, 255, 245)
    shape_pr.line.color.rgb = GREEN
    add_text_box(slide, "PROPOSED · WITH NIVESHRAKSHA\n\n✓ Privacy-first, no accounts needed\n✓ Deterministic, explainable rule engine\n✓ Verifies claims against official sources\n✓ Multilingual UI and chatbot", Inches(7.0), Inches(3.7), Inches(5.1), Inches(2), font_size=16, color=RGBColor(30, 100, 30))

    # ---------------------------------------------------------
    # Slide 5: Innovation & USP
    # ---------------------------------------------------------
    slide = prs.slides.add_slide(blank_layout)
    add_header_and_footer(slide, prs, "Innovation & USP", 5)
    
    content_top = (
        "1. Explainable by construction: no opaque scores. 2. Honest uncertainty: 'not found' is first-class. "
        "3. Network-free URL checking (SSRF safe). 4. Privacy as default."
    )
    add_text_box(slide, content_top, Inches(1.5), Inches(2), Inches(10.5), Inches(1), font_size=20)
    
    # 4 boxes
    def draw_usp_box(slide, num, title, text, left, top):
        shape = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, left, top, Inches(5.5), Inches(1.6))
        shape.fill.solid()
        shape.fill.fore_color.rgb = LIGHT_BG
        shape.line.color.rgb = PURPLE_DARK
        
        add_text_box(slide, str(num), left + Inches(0.2), top + Inches(0.1), Inches(0.5), Inches(0.5), font_size=24, bold=True, color=PURPLE_DARK)
        add_text_box(slide, title, left + Inches(0.8), top + Inches(0.1), Inches(4.5), Inches(0.3), font_size=16, bold=True, color=PURPLE_DARK)
        add_text_box(slide, text, left + Inches(0.8), top + Inches(0.5), Inches(4.5), Inches(1), font_size=14)

    draw_usp_box(slide, 1, "DETERMINISTIC ENGINE", "Flags are matched text plus fixed explanations. No LLM hallucination for critical safety.", Inches(1), Inches(3.5))
    draw_usp_box(slide, 2, "HONEST UNCERTAINTY", "'Could not verify' and 'no red flags' are explicit states. We never claim a clean link is 100% safe.", Inches(6.8), Inches(3.5))
    draw_usp_box(slide, 3, "NETWORK-FREE URL CHECK", "Analyzes URLs via static string matching (punycode, IP literals) without opening sockets.", Inches(1), Inches(5.3))
    draw_usp_box(slide, 4, "BEHAVIOURAL PAUSE", "30-second checklist interrupts scammer's urgency and forces active acknowledgment of risk.", Inches(6.8), Inches(5.3))

    # ---------------------------------------------------------
    # Slide 6: Objective & Scope of Solution
    # ---------------------------------------------------------
    slide = prs.slides.add_slide(blank_layout)
    add_header_and_footer(slide, prs, "Objective & Scope of Solution", 6)
    
    content_top = (
        "Objectives: provide a safe space to verify claims, interrupt scam psychology, and prepare evidence for reporting. "
        "Scope: First-time investors, regional languages, web/mobile delivery."
    )
    add_text_box(slide, content_top, Inches(1.5), Inches(2), Inches(10.5), Inches(1), font_size=20)
    
    shape_obj = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(1), Inches(3.5), Inches(5.5), Inches(2.5))
    shape_obj.fill.solid()
    shape_obj.fill.fore_color.rgb = LIGHT_BG
    shape_obj.line.color.rgb = PURPLE_DARK
    add_text_box(slide, "OBJECTIVES\n\n✓ Detect scam communication deterministically\n✓ Act before money moves (Golden Hour)\n✓ Prepare evidence for official reporting\n✓ Educate in regional languages", Inches(1.2), Inches(3.7), Inches(5.1), Inches(2), font_size=16)

    shape_scp = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(6.8), Inches(3.5), Inches(5.5), Inches(2.5))
    shape_scp.fill.solid()
    shape_scp.fill.fore_color.rgb = LIGHT_BG
    shape_scp.line.color.rgb = PURPLE_DARK
    
    table_content = (
        "SCOPE\n\n"
        "Users      First-time & Senior Retail Investors\n"
        "Languages  English, Tamil, Hindi, Telugu, etc.\n"
        "Input      Text, URLs, Screenshots (OCR)\n"
        "Delivery   Web (Next.js) & Mobile-friendly"
    )
    add_text_box(slide, table_content, Inches(7.0), Inches(3.7), Inches(5.1), Inches(2), font_size=16)

    # ---------------------------------------------------------
    # Slide 7: System Architecture
    # ---------------------------------------------------------
    slide = prs.slides.add_slide(blank_layout)
    add_header_and_footer(slide, prs, "System Architecture", 7)
    
    content_top = (
        "Four layers — Frontend: Next.js + Tailwind. API: FastAPI. Safety Layer: Redaction & Deterministic Rules. "
        "Data Layer: PostgreSQL + Local Vector Store for Chatbot."
    )
    add_text_box(slide, content_top, Inches(1.5), Inches(2), Inches(10.5), Inches(1), font_size=20)
    
    # 4 blocks horizontally
    def draw_arch_box(slide, title, text, left):
        shape = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, left, Inches(3.5), Inches(2.5), Inches(1.5))
        shape.fill.solid()
        shape.fill.fore_color.rgb = LIGHT_BG
        shape.line.color.rgb = PURPLE_DARK
        add_text_box(slide, title, left + Inches(0.1), Inches(3.6), Inches(2.3), Inches(0.3), font_size=14, bold=True, color=PURPLE_DARK)
        add_text_box(slide, text, left + Inches(0.1), Inches(4.0), Inches(2.3), Inches(1), font_size=12)

    draw_arch_box(slide, "CLIENT", "Next.js dashboard\nTypeScript\nTailwind CSS\nshadcn/ui", Inches(1))
    add_text_box(slide, "→", Inches(3.6), Inches(4.0), Inches(0.3), Inches(0.5), font_size=24)
    draw_arch_box(slide, "API LAYER", "FastAPI\nPydantic validation\nRate limits\nPrivacy filters", Inches(4.0))
    add_text_box(slide, "→", Inches(6.6), Inches(4.0), Inches(0.3), Inches(0.5), font_size=24)
    draw_arch_box(slide, "SAFETY ENGINE", "Scam Rules Analyzer\nURL Static Analyzer\nSEBI Adapter\nPII Redactor", Inches(7.0))
    add_text_box(slide, "→", Inches(9.6), Inches(4.0), Inches(0.3), Inches(0.5), font_size=24)
    draw_arch_box(slide, "DATA", "PostgreSQL\nEphemeral storage\nVector DB (RAG)", Inches(10.0))

    # ---------------------------------------------------------
    # Slide 8: Technical Specifications
    # ---------------------------------------------------------
    slide = prs.slides.add_slide(blank_layout)
    add_header_and_footer(slide, prs, "Technical Specifications", 8)
    
    content_top = (
        "Built with strict engineering standards. 66 backend tests (FP/FN harness), strict type checking, "
        "Dockerized environments, and reproducible builds."
    )
    add_text_box(slide, content_top, Inches(1.5), Inches(2), Inches(10.5), Inches(1), font_size=20)
    
    content_list = (
        "• Strict Privacy: Redaction intercepts PAN, Aadhaar, Phone, Email, UPI before any persistence.\n"
        "• Threat Model Mitigations: No sockets opened for URL checks (prevents SSRF). Rate limited at 30 req/min.\n"
        "• AI usage: RAG chatbot uses embeddings. Critical flags are 100% deterministic, no LLM involved.\n"
        "• Security Scans: Gitleaks, Semgrep, Trivy ready. Docker containerized as non-root."
    )
    add_text_box(slide, content_list, Inches(1.5), Inches(3.5), Inches(10), Inches(3), font_size=18)

    # ---------------------------------------------------------
    # Slide 9: Impact and Evaluation
    # ---------------------------------------------------------
    slide = prs.slides.add_slide(blank_layout)
    add_header_and_footer(slide, prs, "Impact and Evaluation", 9)
    
    # 4 stats
    def draw_stat(slide, stat, label, left, top):
        add_text_box(slide, stat, left, top, Inches(2.5), Inches(0.6), font_size=36, bold=True, color=PURPLE_DARK, align=PP_ALIGN.CENTER)
        add_text_box(slide, label, left, top + Inches(0.8), Inches(2.5), Inches(0.6), font_size=14, align=PP_ALIGN.CENTER)

    draw_stat(slide, "10/10", "Evaluation Cases Passed", Inches(1), Inches(3))
    draw_stat(slide, "0%", "False Positives in Suite", Inches(4), Inches(3))
    draw_stat(slide, "72-Hour", "Max Data Retention", Inches(7), Inches(3))
    draw_stat(slide, "6+", "Languages Supported", Inches(10), Inches(3))

    content = "Note: Evaluated on synthetic FP/FN harness targeting known scam patterns (guaranteed returns, urgency, credentials)."
    add_text_box(slide, content, Inches(1), Inches(5.5), Inches(11), Inches(1), font_size=14)

    # ---------------------------------------------------------
    # Slide 10: Thank You
    # ---------------------------------------------------------
    slide = prs.slides.add_slide(blank_layout)
    
    # Big icon (Like thumb up in PDF, we use text symbol)
    circle = slide.shapes.add_shape(MSO_SHAPE.OVAL, Inches(1.5), Inches(2), Inches(2.5), Inches(2.5))
    circle.fill.solid()
    circle.fill.fore_color.rgb = PURPLE_LIGHT
    circle.line.fill.background()
    add_text_box(slide, "🛡️", Inches(1.5), Inches(2.5), Inches(2.5), Inches(1.5), font_size=72, align=PP_ALIGN.CENTER)

    add_text_box(slide, "Thank You!", Inches(4.5), Inches(2.5), Inches(6), Inches(1.5), font_size=72, bold=True, color=TEXT_DARK)
    
    line = slide.shapes.add_connector(1, Inches(0), Inches(3.2), Inches(4.5), Inches(3.2))
    line.line.color.rgb = BORDER_GRAY
    
    line = slide.shapes.add_connector(1, Inches(10), Inches(3.2), prs.slide_width, Inches(3.2))
    line.line.color.rgb = BORDER_GRAY

    contact = "CONTACT · [Contact Email] · [Repo Link] · Live demo available on request"
    add_text_box(slide, contact, Inches(1), Inches(6), Inches(11), Inches(0.5), font_size=14, bold=True, color=PURPLE_DARK)
    
    add_header_and_footer(slide, prs, None, 10)

    prs.save(filename)
    print(f"Saved {filename}")

if __name__ == '__main__':
    create_presentation()
