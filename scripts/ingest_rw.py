"""Ingest the Reading and Writing export (questions, answers and rationales in one PDF).

Usage: python ingest_rw.py <rw.pdf> <out_dir> [limit]
Needs: pymupdf, pillow, numpy
Writes: <out_dir>/rw/<id>.json (text content), <out_dir>/img/<id>-stem<k>.webp (figure stems only),
        <out_dir>/rw-index.json (metadata).
Plain text questions become real text. A question whose stem holds a figure or table keeps an image stem.
Underlines and blanks are kept as [[u]]..[[/u]] and [[blank]] markers.
"""
import sys, re, json, os, statistics
import fitz, numpy as np
from PIL import Image

pdf, out = sys.argv[1], sys.argv[2]
limit = int(sys.argv[3]) if len(sys.argv) > 3 else None
S, LX, RX, PAD = 2.0, 8, 604, 6
os.makedirs(f"{out}/rw", exist_ok=True); os.makedirs(f"{out}/img", exist_ok=True)
D = fitz.open(pdf)

def streams():
    res, cur = [], None
    for i, p in enumerate(D):
        m = re.search(r"Question ID:\s*(\w+)", p.get_text())
        if m: cur = [m.group(1), []]; res.append(cur)
        cur[1].append(i)
    return res

def page_items(pi):
    """Words (merged across kerning splits), thin horizontal rules and large drawings for a page."""
    p = D[pi]
    ws = sorted(p.get_text("words"), key=lambda w: (round(w[1]), w[0]))
    merged = []
    for w in ws:
        if merged and abs(merged[-1][1] - w[1]) < 2 and 0 <= w[0] - merged[-1][2] < 1.0:
            a = merged[-1]; merged[-1] = [a[0], min(a[1], w[1]), w[2], max(a[3], w[3]), a[4] + w[4]]
        else:
            merged.append([w[0], w[1], w[2], w[3], w[4]])
    thin, big = [], []
    for dr in p.get_drawings():
        r = dr["rect"]
        if r.y0 < 135: continue
        if r.width < 14 and r.height < 14: continue  # a glyph drawn as a path
        (thin if r.height < 2.5 else big).append(r)
    return merged, thin, big

def lines_of(words, thin, pi):
    """Group words into lines; apply underline/blank markers from thin rules."""
    used = set()
    for r in thin:
        yc = (r.y0 + r.y1) / 2
        hit = [k for k, w in enumerate(words) if w[3] - 4 <= yc <= w[3] + 3 and min(w[2], r.x1) - max(w[0], r.x0) > 0.4 * (w[2] - w[0])]
        if hit:
            for k in hit: used.add(k)
        else:
            words.append([r.x0, yc - 9, r.x1, yc + 1, "[[blank]]"])
    for k in used:
        words[k][4] = f"[[u]]{words[k][4]}[[/u]]"
    words.sort(key=lambda w: (round(w[1] / 3), w[0]))
    lines = []
    for w in words:
        if lines and abs(lines[-1]["y"] - w[1]) < 4:
            lines[-1]["w"].append(w)
        else:
            lines.append({"y": w[1], "y1": w[3], "w": [w], "page": pi})
    for l in lines:
        l["w"].sort(key=lambda w: w[0])
        parts = []
        for k, w in enumerate(l["w"]):
            if k and w[0] - l["w"][k - 1][2] >= 1.0: parts.append(" ")
            parts.append(w[4])
        l["text"] = "".join(parts).replace("[[/u]] [[u]]", " ")
        l["x0"] = l["w"][0][0]
    return lines

def paragraphs(lines):
    if not lines: return []
    # the smallest ordinary line step is the base pitch; anything well above it is a paragraph break
    pitch = min([b["y"] - a["y"] for a, b in zip(lines, lines[1:]) if b["page"] == a["page"] and 12 < b["y"] - a["y"] < 40] or [17.5])
    paras, cur = [], [lines[0]["text"]]
    for a, b in zip(lines, lines[1:]):
        gap = (b["y"] - a["y"]) if b["page"] == a["page"] else 0
        if gap > 1.35 * pitch: paras.append(" ".join(cur)); cur = []
        cur.append(b["text"])
    paras.append(" ".join(cur))
    return [re.sub(r"\[\[/u\]\] \[\[u\]\]", " ", re.sub(r"\s+", " ", p)).strip() for p in paras if p.strip()]

def trim(img):
    a = np.asarray(img.convert("L")); ys, xs = np.where(a < 245)
    if not len(ys): return None
    return img.crop((max(xs.min() - PAD, 0), max(ys.min() - PAD, 0), min(xs.max() + PAD, img.width), min(ys.max() + PAD, img.height)))

def render(pi, y0, y1):
    pm = D[pi].get_pixmap(matrix=fitz.Matrix(S, S), clip=fitz.Rect(LX, y0, RX, y1), alpha=False)
    return Image.frombytes("RGB", (pm.width, pm.height), pm.samples)

def stem_images(qid, segs):
    """segs: [(page, y0, y1)] for the stem region; split at blank gaps into bands."""
    parts = [render(*s) for s in segs]
    w = max(p.width for p in parts); h = sum(p.height for p in parts)
    img = Image.new("RGB", (w, h), "white"); y = 0
    for p in parts: img.paste(p, (0, y)); y += p.height
    ink = (np.asarray(img.convert("L")) < 245).any(axis=1)
    bands, start, blank = [], None, 0
    for y, has in enumerate(ink):
        if has:
            if start is None: start = y
            blank, end = 0, y
        elif start is not None:
            blank += 1
            if blank >= 24: bands.append((start, end)); start = None
    if start is not None: bands.append((start, end))
    res = []
    for k, (a, b) in enumerate(bands):
        t = trim(img.crop((0, a, img.width, b + 1)))
        t.save(f"{out}/img/{qid}-stem{k}.webp", quality=88, method=6)
        res.append([t.width, t.height, 1 if t.width < 0.75 * img.width else 0])
    return res

index = []
for qid, pages in streams()[:limit]:
    first = D[pages[0]]
    hdr = first.get_text("words")
    # header: domain and skill by column bands
    dif = [r for r in first.search_for("Difficulty")][0]
    ql = [r for r in first.search_for("Question") if r.y0 > 100][0]
    cols = {"domain": (245, 360), "skill": (360, 475)}
    meta = {}
    for k, (a, b) in cols.items():
        ws = sorted([w for w in hdr if dif.y1 < w[1] < ql.y0 and a <= w[0] < b], key=lambda w: (round(w[1]), w[0]))
        meta[k] = " ".join(w[4] for w in ws)
    allines, figure = [], False
    for pi in pages:
        words, thin, big = page_items(pi)
        if big: figure = True
        allines += lines_of(words, thin, pi)
    # section split on label lines
    sec, cur = {}, "head"
    for l in allines:
        t = re.sub(r"\[\[/?u\]\]", "", l["text"]).strip()
        if cur == "head" and t == "Question" and l["y"] > 100: cur = "stem"; sec[cur] = []; l["label"] = True
        elif cur == "stem" and t == "Answer": cur = "choices"; sec[cur] = []; l["label"] = True
        elif cur in ("stem", "choices") and t.startswith("Correct Answer"): cur = "correct"; sec[cur] = [l]; l["label"] = True
        elif cur in ("correct", "choices", "stem") and t == "Rationale": cur = "rationale"; sec[cur] = []; l["label"] = True
        elif cur != "head": sec.setdefault(cur, []).append(l)
        l["sec"] = cur
    am = re.search(r"Correct Answer:\s*([A-D])", " ".join(l["text"] for l in sec.get("correct", [])))
    answer = am.group(1) if am else None
    # choices
    choices, curL = {}, None
    for l in sec.get("choices", []):
        m = re.match(r"^([A-D])\.\s*(.*)$", l["text"])
        if m: curL = m.group(1); choices[curL] = [m.group(2)]
        elif curL: choices[curL].append(l["text"])
    choices = {k: re.sub(r"\s+", " ", " ".join(v)).strip() for k, v in choices.items()}
    rec = {"id": qid, "choices": choices, "rationale": paragraphs(sec.get("rationale", []))}
    if figure:
        # stem region: from the Question label bottom to the Answer label top, across pages
        segs, started = [], False
        for pi in pages:
            pg = D[pi]
            qy = [r for r in pg.search_for("Question") if r.y0 > 100] if not started else [None]
            ay = [r for r in pg.search_for("Answer") if abs(r.x0 - 18) < 6 and (qy[0] is None or r.y0 > qy[0].y1)] if (qy or started) else []
            top = (qy[0].y1 if qy[0] is not None else 30) if (qy or started) else None
            if top is None: continue
            started = True
            bottom = ay[0].y0 if ay else pg.rect.height - 20
            segs.append((pi, top, bottom))
            if ay: break
        rec["stemImages"] = stem_images(qid, segs)
    else:
        rec["stem"] = paragraphs(sec.get("stem", []))
    json.dump(rec, open(f"{out}/rw/{qid}.json", "w"), ensure_ascii=False, separators=(",", ":"))
    index.append({"id": qid, "domain": meta["domain"], "skill": meta["skill"], "answer": answer, "figure": figure, "nChoices": len(choices)})
    if len(index) % 50 == 0: print(len(index), flush=True)
json.dump(index, open(f"{out}/rw-index.json", "w"), indent=1)
print(len(index), "questions")
