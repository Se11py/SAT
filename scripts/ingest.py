"""Ingest the question-bank PDFs into per-question images + a JSON index.

Usage: python ingest.py <questions.pdf> <answers.pdf> <out_dir> [limit]
Needs: pymupdf, pillow, numpy
Writes: <out_dir>/img/<id>-{stem,A,B,C,D,rat}.webp and <out_dir>/questions.json
"""
import sys, re, json, os
import fitz, numpy as np
from PIL import Image

qpdf, apdf, out = sys.argv[1], sys.argv[2], sys.argv[3]
limit = int(sys.argv[4]) if len(sys.argv) > 4 else None
S = 2.0                    # render scale (144 dpi)
LX, RX = 8, 604           # content x-range in pt
PAD = 6                    # px padding around trimmed ink
os.makedirs(f"{out}/img", exist_ok=True)

Q, A = fitz.open(qpdf), fitz.open(apdf)

def streams(doc):
    res, cur = [], None
    for i, p in enumerate(doc):
        m = re.search(r"Question ID:\s*(\w+)", p.get_text())
        if m:
            cur = [m.group(1), []]; res.append(cur)
        cur[1].append(i)
    return res

def render(page, y0, y1):
    clip = fitz.Rect(LX, y0, RX, y1)
    pm = page.get_pixmap(matrix=fitz.Matrix(S, S), clip=clip, alpha=False)
    return Image.frombytes("RGB", (pm.width, pm.height), pm.samples)

def trim(img):
    a = np.asarray(img.convert("L"))
    ys, xs = np.where(a < 245)
    if len(ys) == 0:
        return None
    x0, x1 = max(xs.min() - PAD, 0), min(xs.max() + PAD, img.width)
    y0, y1 = max(ys.min() - PAD, 0), min(ys.max() + PAD, img.height)
    return img.crop((x0, y0, x1, y1))

def save(img, name):
    img = trim(img)
    if img is None:
        return False
    img.save(f"{out}/img/{name}.webp", quality=88, method=6)
    return True

def split_bands(img, qid, gap=20):
    """Split the stem at blank gaps so figures and text can be laid out (and scaled) separately."""
    a = np.asarray(img.convert("L"))
    ink = (a < 245).any(axis=1)
    bands, start, blank = [], None, 0
    for y, has in enumerate(ink):
        if has:
            if start is None: start = y
            blank = 0; end = y
        elif start is not None:
            blank += 1
            if blank >= gap: bands.append((start, end)); start = None
    if start is not None: bands.append((start, end))
    out_ = []
    for k, (y0, y1) in enumerate(bands):
        band = trim(img.crop((0, y0, img.width, y1 + 1)))
        band.save(f"{out}/img/{qid}-stem{k}.webp", quality=88, method=6)
        out_.append({"w": band.width, "h": band.height, "centre": band.width < 0.75 * img.width})
    return out_

def find(page, text):
    r = page.search_for(text)
    return r[0] if r else None

def meta(page):
    # header table: words grouped by column x-bands
    words = page.get_text("words")
    hdr = find(page, "Difficulty")
    qlabel = [r for r in page.search_for("Question") if r.y0 > hdr.y1]
    ytop, ybot = hdr.y1, qlabel[0].y0
    cols = {"assessment": (0, 130), "test": (130, 245), "domain": (245, 360), "skill": (360, 475), "difficulty": (475, 612)}
    out_ = {}
    for k, (a, b) in cols.items():
        ws = [w for w in words if w[1] > ytop and w[3] < ybot and a <= w[0] < b]
        ws.sort(key=lambda w: (round(w[1]), w[0]))
        out_[k] = " ".join(w[4] for w in ws)
    return out_

qs, as_ = streams(Q), dict(streams(A))
rows = []
for qid, qpages in qs[:limit]:
    qp = Q[qpages[0]]
    m = meta(qp)
    # --- question + choices from the questions pdf
    ql = [r for r in qp.search_for("Question") if r.y0 > 100][0]
    al = [r for r in qp.search_for("Answer") if r.y0 > ql.y1 and abs(r.x0 - 18) < 6]
    page_h = qp.rect.height
    # end of ink on the page
    body_bottom = page_h - 20
    choices = {}
    if al:
        a_top = al[0].y1
        stem = render(qp, ql.y1, al[0].y0)
        letters = []
        for L in "ABCD":
            hit = [r for r in qp.search_for(f"{L}.") if r.y0 >= a_top - 2 and r.x0 < 40]
            if hit: letters.append((L, hit[0].y0, hit[0].x1))
        for k, (L, y, lx1) in enumerate(letters):
            y1 = letters[k + 1][1] if k + 1 < len(letters) else body_bottom
            # crop x after the "L." label (x ~ 36pt)
            img = render(qp, y - 2, y1 - 2)
            img = img.crop((max(int((lx1 + 1 - LX) * S), 0), 0, img.width, img.height))
            if save(img, f"{qid}-{L}"): choices[L] = True
    else:
        stem = render(qp, ql.y1, body_bottom)
    bands = split_bands(stem, qid)
    # --- answer + rationale from the answers pdf
    ap = as_[qid]
    texts = "\n".join(A[i].get_text() for i in ap)
    am = re.search(r"Correct Answer:\s*([^\n]+)", texts)
    answer = am.group(1).strip() if am else None
    # rationale image: from the Rationale label to the end of the stream
    parts = []
    started = False
    for i in ap:
        pg = A[i]
        top = 0 if started else None
        if not started:
            r = [r for r in pg.search_for("Rationale") if r.y0 > 100]
            if r:
                started, top = True, r[0].y1
        if started:
            parts.append(render(pg, top if top else 30, pg.rect.height - 20))
    rat = None
    if parts:
        parts = [t for t in (trim(p) for p in parts) if t is not None]
        if parts:
            w = max(p.width for p in parts); h = sum(p.height for p in parts)
            rat = Image.new("RGB", (w, h), "white"); y = 0
            for p in parts: rat.paste(p, (0, y)); y += p.height
            rat.save(f"{out}/img/{qid}-rat.webp", quality=88, method=6)
    rows.append({
        "id": qid, "domain": m["domain"], "skill": m["skill"], "difficulty": m["difficulty"],
        "answer": answer, "type": "mcq" if choices else "spr",
        "choices": sorted(choices), "hasRationale": rat is not None, "stem": bands,
        "w": {"stem": None},
    })
json.dump(rows, open(f"{out}/questions.json", "w"), indent=1)
print(len(rows), "questions")
