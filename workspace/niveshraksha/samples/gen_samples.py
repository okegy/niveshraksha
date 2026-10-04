from PIL import Image, ImageDraw, ImageFont

FONT = "C:/Windows/Fonts/segoeui.ttf"
FONT_B = "C:/Windows/Fonts/segoeuib.ttf"
def F(sz, bold=False): return ImageFont.truetype(FONT_B if bold else FONT, sz)

def wrap(draw, text, font, max_w):
    words, lines, cur = text.split(), [], ""
    for w in words:
        t = (cur + " " + w).strip()
        if draw.textlength(t, font=font) <= max_w: cur = t
        else: lines.append(cur); cur = w
    if cur: lines.append(cur)
    return lines

# 1. Telegram dark tip-group message
W, H = 720, 560
img = Image.new("RGB", (W, H), (14, 22, 33))
d = ImageDraw.Draw(img)
d.rectangle([0, 0, W, 64], fill=(16, 28, 41))
d.ellipse([16, 12, 56, 52], fill=(43, 104, 82))
d.text((68, 16), "Golden Pips Official", font=F(19, True), fill=(255, 255, 255))
d.text((68, 42), "581 members", font=F(13), fill=(126, 141, 155))
d.text((W - 130, 22), "8:47 PM", font=F(13), fill=(126, 141, 155))
msg = ("PREMIUM SIGNAL\nSEBI-approved advisory group\nGuaranteed 40% monthly return!\n"
       "Only 2 slots left - invest today\nSend PAN + UPI screenshot & OTP\nto @GoldPipsAdmin to join")
bx, by, bw = 24, 84, 520
lines = []
for seg in msg.split("\n"):
    lines += wrap(d, seg, F(17), bw - 40)
bh = 24 + len(lines) * 26 + 14
d.rounded_rectangle([bx, by, bx + bw, by + bh], radius=14, fill=(23, 33, 43))
y = by + 14
for ln in lines:
    col = (245, 165, 35) if ("Guaranteed" in ln or "OTP" in ln) else (230, 233, 235)
    d.text((bx + 20, y), ln, font=F(17), fill=col)
    y += 26
d.text((bx + bw - 74, by + bh - 22), "8:47", font=F(12), fill=(126, 141, 155))
d.text((24, by + bh + 24), "Admin turned off messaging for members", font=F(12), fill=(126, 141, 155))
img.save("ocr-telegram-tip.png")

# 2. WhatsApp light KYC-threat SMS
W, H = 720, 420
img = Image.new("RGB", (W, H), (227, 219, 205))
d = ImageDraw.Draw(img)
d.rectangle([0, 0, W, 60], fill=(79, 77, 75))
d.text((20, 18), "SBI-KYC-Alert                today", font=F(15), fill=(230, 227, 222))
bx, by, bw = 40, 84, 600
msg = ("Dear Customer, your KYC has EXPIRED. Account will be FROZEN within 24 hours. "
       "Pay Rs.499 verification charge to unlock withdrawals now: http://sbi-kyc-update.xyz")
lines = wrap(d, msg, F(17), bw - 40)
bh = 22 + len(lines) * 26 + 12
d.rounded_rectangle([bx, by, bx + bw, by + bh], radius=12, fill=(220, 248, 198))
y = by + 12
for ln in lines:
    d.text((bx + 16, y), ln, font=F(17), fill=(17, 19, 20)); y += 26
d.text((bx + bw - 90, by + bh - 20), "10:32 AM", font=F(12), fill=(102, 112, 105))
img.save("ocr-whatsapp-kyc.png")

# 3. Profit screenshot (fake P&L)
W, H = 640, 420
img = Image.new("RGB", (W, H), (250, 250, 250))
d = ImageDraw.Draw(img)
d.rectangle([0, 0, W, 54], fill=(255, 255, 255), outline=(225, 225, 225))
d.text((20, 16), "My Portfolio - P&L Summary", font=F(19, True), fill=(20, 20, 20))
rows = [("Stock Tips Premium Plan", "+40.0%", (16, 145, 76)),
        ("IPO Allotment Service", "+35.2%", (16, 145, 76)),
        ("Crypto Signal Bonus", "+52.7%", (16, 145, 76)),
        ("Total Profit (30 days)", "+127.9%", (16, 145, 76))]
y = 84
for name, val, col in rows:
    d.rectangle([24, y, W - 24, y + 56], fill=(255, 255, 255), outline=(230, 230, 230))
    d.text((40, y + 16), name, font=F(17), fill=(60, 60, 60))
    d.text((W - 180, y + 13), val, font=F(22, True), fill=col)
    y += 66
d.text((20, y + 8), "Screenshot proof - 100% guaranteed returns", font=F(15), fill=(150, 40, 40))
img.save("ocr-profit-claim.png")
print("3 sample images generated")
