"""Mux the demo: raw walkthrough video + timed TTS narration/Guide audio.

The tag-less narration clips were overwritten during recording, so their texts
are recovered from the recorder script (in source order, 1:1 with the
timeline's "TTS undefined" events), regenerated via the voice endpoint, and
everything is muxed onto the video with ffmpeg.
"""
import json
import os
import re
import subprocess
import urllib.request

import imageio_ffmpeg

FF = imageio_ffmpeg.get_ffmpeg_exe()
DEMO = r"D:\sangyam hackathon\docs\demo"
SCRIPT = r"D:\sangyam hackathon\workspace\niveshraksha\frontend\record_demo.tmp.mjs"
BACKEND = "http://localhost:8000"

# ---- 1. Recover the tag-less narration texts from the recorder script ----
src = open(SCRIPT, encoding="utf-8").read()
NARR = []
pos = 0
while True:
    start = src.find('await tts("', pos)
    if start == -1:
        break
    i = start + len('await tts("')
    end = src.find('"', i)
    after = src[end:end + 4]
    text = src[i:end]
    if after.startswith('");'):
        NARR.append(text.replace("\\n", " "))
    pos = end + 1

# ---- 2. Timeline: build the clip list (offset + file) ----
tl = json.load(open(os.path.join(DEMO, "timeline.json"), encoding="utf-8"))
clips = []
undef_idx = 0
for e in tl:
    if e["kind"] != "audio":
        continue
    offset = max(0, e["offset_ms"] - 250)
    m = re.match(r"TTS (.+?) \(", e["label"])
    if m and m.group(1) != "undefined":
        p = os.path.join(DEMO, "tts-" + m.group(1) + ".wav")
        if os.path.exists(p):
            clips.append((offset, p))
    else:
        text = NARR[undef_idx]
        out = os.path.join(DEMO, "tts-fix-" + format(undef_idx, "02d") + ".wav")
        req = urllib.request.Request(
            BACKEND + "/api/v1/voice/speak",
            data=json.dumps({"text": text[:850], "language": "en-IN"}).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=90) as r:
            open(out, "wb").write(r.read())
        clips.append((offset, out))
        undef_idx += 1
        print("regenerated fix-" + format(undef_idx - 1, "02d") + " @" + str(offset) + "ms")

print("total clips:", len(clips), "(undefined regenerated:", str(undef_idx) + ")")
assert undef_idx == len(NARR), "mapping broken: " + str(undef_idx) + " vs " + str(len(NARR))

# ---- 3. Audio graph + mux ----
# Input 0 = video; audio clips are inputs 1..N.
inputs = []
filters = []
labels = []
for i, (offset, path) in enumerate(clips):
    inputs += ["-i", path]
    d = int(offset)
    idx = i + 1
    filters.append("[" + str(idx) + ":a]adelay=" + str(d) + "|" + str(d) + "[a" + str(i) + "]")
    labels.append("[a" + str(i) + "]")

filter_complex = (
    ";".join(filters)
    + ";"
    + "".join(labels)
    + "amix=inputs=" + str(len(clips)) + ":normalize=0,apad[aout]"
)

cmd = [
    FF, "-y",
    "-i", os.path.join(DEMO, "niveshraksha-demo-raw.webm"),
    *[x for clip in clips for x in ("-i", clip[1])],
    "-filter_complex", filter_complex,
    "-map", "0:v", "-map", "[aout]",
    "-c:v", "libx264", "-preset", "fast", "-crf", "22",
    "-c:a", "aac", "-b:a", "160k",
    "-movflags", "+faststart",
    os.path.join(DEMO, "niveshraksha-demo.mp4"),
]
print("muxing (video re-encode, a few minutes)...")
res = subprocess.run(cmd, capture_output=True, text=True)
if res.returncode != 0:
    print("FFMPEG ERROR:", res.stderr[-1200:])
    raise SystemExit(1)
size = os.path.getsize(os.path.join(DEMO, "niveshraksha-demo.mp4"))
print("OK -> niveshraksha-demo.mp4 (" + format(size / 1_048_576, ".1f") + " MB)")
