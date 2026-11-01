"""Merge public/bank/questions.json with the manual answer patch and image sizes
into src/data/bank.json (the only data file the app imports)."""
import json, os
from PIL import Image

root = os.path.join(os.path.dirname(__file__), "..")
raw = json.load(open(f"{root}/public/bank/questions.json"))
patch = json.load(open(f"{root}/scripts/answer-patch.json"))

DOMAINS = [
    ("algebra", "Algebra", "Algebra"),
    ("advanced", "Advanced Math", "Advanced Math"),
    ("data", "Problem-Solving and Data Analysis", "Problem-Solving & Data"),
    ("geometry", "Geometry and Trigonometry", "Geometry & Trig"),
]
NAMES = {
    "Ratios, rates, propor tional relationships, and units": "Ratios, rates, proportional relationships, and units",
}
SHORT = {
    "Nonlinear equations in one variable and systems of equations in two variables": "Nonlinear equations and systems",
    "Linear inequalities in one or two variables": "Linear inequalities",
    "Systems of two linear equations in two variables": "Systems of two linear equations",
    "One-variable data: Distributions and measures of center and spread": "One-variable data",
    "Two-variable data: Models and scatterplots": "Two-variable data",
    "Evaluating statistical claims: Observational studies and experiments": "Evaluating statistical claims",
    "Inference from sample statistics and margin of error": "Inference and margin of error",
    "Ratios, rates, propor tional relationships, and units": "Ratios, rates, and proportions",
    "Probability and conditional probability": "Probability",
    "Right triangles and trigonometry": "Right triangles and trigonometry",
}
dom_idx = {d[1]: i for i, d in enumerate(DOMAINS)}
skills, skill_idx = [], {}
qs = []
sz = lambda n: Image.open(f"{root}/public/bank/img/{n}.webp").size
for r in raw:
    key = (r["domain"], r["skill"])
    if key not in skill_idx:
        skill_idx[key] = len(skills)
        skills.append({"name": NAMES.get(r["skill"], r["skill"]), "short": SHORT.get(r["skill"], NAMES.get(r["skill"], r["skill"])), "domain": dom_idx[r["domain"]]})
    ans = r["answer"] or patch.get(r["id"])
    assert ans, r["id"]
    q = {"id": r["id"], "s": skill_idx[key], "a": ans, "stem": [[b["w"], b["h"], 1 if b["centre"] else 0] for b in r["stem"]]}
    if r["choices"]:
        q["c"] = [list(sz(f"{r['id']}-{L}")) for L in r["choices"]]
    if r["hasRationale"]:
        q["r"] = list(sz(f"{r['id']}-rat"))
    qs.append(q)
# order skills: by domain then by size desc is not needed; keep domain order, then name
order = sorted(range(len(skills)), key=lambda i: (skills[i]["domain"], i))
remap = {old: new for new, old in enumerate(order)}
skills = [skills[i] for i in order]
for q in qs: q["s"] = remap[q["s"]]
out_domains = [{"id": d[0], "name": d[1], "short": d[2], "subject": "math", "line": i} for i, d in enumerate(DOMAINS)]

# ---- Reading and Writing (public/bank/rw-index.json from ingest_rw.py) ----
RW_DOMAINS = [
    ("info", "Information and Ideas", "Information & Ideas"),
    ("craft", "Craft and Structure", "Craft & Structure"),
    ("expr", "Expression of Ideas", "Expression of Ideas"),
    ("conv", "Standard English Conventions", "Standard English"),
]
RW_SHORT = {
    "Central Ideas and Details": "Central ideas and details", "Command of Evidence": "Command of evidence",
    "Words in Context": "Words in context", "Text Structure and Purpose": "Text structure and purpose",
    "Cross-Text Connections": "Cross-text connections", "Rhetorical Synthesis": "Rhetorical synthesis",
    "Form, Structure, and Sense": "Form, structure, and sense",
}
rw_path = f"{root}/public/bank/rw-index.json"
if os.path.exists(rw_path):
    rw = json.load(open(rw_path))
    base = len(out_domains)
    out_domains += [{"id": d[0], "name": d[1], "short": d[2], "subject": "rw", "line": i} for i, d in enumerate(RW_DOMAINS)]
    rw_dom = {d[1]: base + i for i, d in enumerate(RW_DOMAINS)}
    rw_skill = {}
    for r in rw:
        dname = next((n for n in rw_dom if r["domain"].replace("Standard English", "Standard English Conventions") == n or n.startswith(r["domain"])), None)
        assert dname, r
        r["skill"] = {"Cross-text Connections": "Cross-Text Connections"}.get(r["skill"], r["skill"])
        key = (dname, r["skill"])
        if key not in rw_skill:
            rw_skill[key] = len(skills)
            skills.append({"name": key[1], "short": RW_SHORT.get(key[1], key[1]), "domain": rw_dom[dname]})
        assert r["answer"] and r["nChoices"] == 4, r["id"]
        q = {"id": r["id"], "s": rw_skill[key], "a": r["answer"], "rw": 1}
        if r["figure"]:
            c = json.load(open(f"{root}/public/bank/rw/{r['id']}.json"))
            q["fig"] = c["stemImages"]
        qs.append(q)

os.makedirs(f"{root}/src/data", exist_ok=True)
subjects = [
    {"id": "math", "name": "Math", "short": "Math", "path": "/"},
    {"id": "rw", "name": "Reading and Writing", "short": "Reading & Writing", "path": "/reading-writing"},
]
json.dump({"subjects": subjects, "domains": out_domains, "skills": skills, "questions": qs}, open(f"{root}/src/data/bank.json", "w"), separators=(",", ":"))
print(len(qs), "questions,", len(skills), "skills")
