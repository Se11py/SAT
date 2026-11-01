"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { byId, domains, img, LETTERS, lineVar, MIN_SCALE, onLineVar, questions, SCALE, SET_SIZE, skillQuestions, skills, subjectOfSkill, subjectQuestions, subjects, type Band, type Question, type SubjectId } from "@/lib/bank";
import { gradeResponse } from "@/lib/grade";
import { readStore, recordAnswer, setLastSkill } from "@/lib/progress";
import { Calculator } from "./Calculator";
import { Arrow, Check, Chevron, Cross } from "./icons";

type Outcome = "ok" | "no" | "skip";
const shuffle = <T,>(a: T[]) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

/** New questions first, then ones last answered wrong, then solved ones. */
function buildQueue(pool: Question[]): Question[] {
  const store = readStore();
  const fresh = shuffle(pool.filter((q) => !store[q.id]));
  const missed = shuffle(pool.filter((q) => store[q.id] && !store[q.id].last));
  const solved = shuffle(pool.filter((q) => store[q.id]?.last));
  return [...fresh, ...missed, ...solved].slice(0, SET_SIZE);
}

function Pic({ id, part, size, alt, className }: { id: string; part: string; size: [number, number]; alt: string; className?: string }) {
  const w = Math.round(size[0] * SCALE), h = Math.round(size[1] * SCALE);
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={img(id, part)} width={w} height={h} alt={alt} className={className} style={{ maxWidth: "100%", minWidth: Math.round(size[0] * MIN_SCALE), height: "auto" }} />;
}

type RwContent = { stem?: string[]; stemImages?: Band[]; choices: Record<string, string>; rationale: string[] };
const rwCache = new Map<string, RwContent>();
const loadRw = (id: string): Promise<RwContent> =>
  rwCache.has(id) ? Promise.resolve(rwCache.get(id)!) : fetch(`/bank/rw/${id}.json`).then((r) => { if (!r.ok) throw new Error("load"); return r.json() as Promise<RwContent>; }).then((c) => (rwCache.set(id, c), c));

/** Text with the ingest's [[u]]underline[[/u]] and [[blank]] markers rendered as real markup. */
function Rich({ text }: { text: string }) {
  const parts = text.split(/(\[\[u\]\]|\[\[\/u\]\]|\[\[blank\]\])/);
  let u = false;
  return (
    <>
      {parts.map((p, k) => {
        if (p === "[[u]]") { u = true; return null; }
        if (p === "[[/u]]") { u = false; return null; }
        if (p === "[[blank]]") return <span key={k} role="img" aria-label="blank" className="mx-1 inline-block w-16 border-b-2 border-ink align-baseline">&nbsp;</span>;
        return u ? <u key={k} className="underline-offset-4">{p}</u> : p;
      })}
    </>
  );
}

/** A scroll box so images that cannot shrink further on a phone scroll instead of becoming unreadable. */
const Scroll = ({ children, centre }: { children: React.ReactNode; centre?: boolean }) => (
  <div className="overflow-x-auto" tabIndex={0} role="group" aria-label="Question content, scrolls sideways on small screens"><div className={centre ? "mx-auto w-fit" : "w-fit"}>{children}</div></div>
);

export function Practice() {
  const router = useRouter();
  const params = useSearchParams();
  const skillParam = params.get("skill"), mode = params.get("mode"), qParam = params.get("q");
  const subjectParam: SubjectId = params.get("subject") === "rw" ? "rw" : "math";
  const [queue, setQueue] = useState<Question[] | null>(null);
  const [round, setRound] = useState(0);
  const [i, setI] = useState(0);
  const [pick, setPick] = useState("");
  const [checked, setChecked] = useState<Outcome | null>(null);
  const [results, setResults] = useState<Outcome[]>([]);
  const [calcOpen, setCalcOpen] = useState(false);
  const [content, setContent] = useState<{ id: string; data: RwContent } | "error" | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const headRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    let pool = subjectQuestions(subjectParam);
    if (qParam && byId.has(qParam)) pool = [byId.get(qParam)!];
    else if (mode === "missed") { const s = readStore(); pool = questions.filter((q) => s[q.id] && !s[q.id].last); }
    else if (skillParam !== null && skillQuestions[Number(skillParam)]) pool = skillQuestions[Number(skillParam)];
    if (skillParam !== null && skillQuestions[Number(skillParam)]) setLastSkill(Number(skillParam));
    setQueue(qParam ? pool : buildQueue(pool));
    setI(0); setPick(""); setChecked(null); setResults([]);
  }, [skillParam, mode, qParam, round, subjectParam]);

  const q = queue?.[i];
  const done = queue !== null && i >= queue.length;
  const d = q ? skills[q.s].domain : skillParam !== null && skills[Number(skillParam)] ? skills[Number(skillParam)].domain : 0;
  const isMcq = !!q?.c || !!q?.rw;
  const subject: SubjectId = q ? subjectOfSkill(q.s) : skillParam !== null && skills[Number(skillParam)] ? subjectOfSkill(Number(skillParam)) : subjectParam;
  const home = subject === "rw" ? "/reading-writing" : "/";
  const rwNow = q?.rw ? (content !== "error" && content?.id === q.id ? content.data : null) : null;

  useEffect(() => {
    setContent(null);
    if (!q?.rw) return;
    let live = true;
    loadRw(q.id).then((data) => live && setContent({ id: q.id, data })).catch(() => live && setContent("error"));
    const nx = queue?.[i + 1];
    if (nx?.rw) loadRw(nx.id).catch(() => {});
    return () => { live = false; };
  }, [q?.id, q?.rw, queue, i]);

  const check = useCallback(() => {
    if (!q || checked || !pick.trim() || (q.rw && !rwNow)) return;
    const ok = isMcq ? pick === q.a : gradeResponse(pick, q.a);
    recordAnswer(q.id, ok);
    setChecked(ok ? "ok" : "no");
    setResults((r) => [...r, ok ? "ok" : "no"]);
  }, [q, checked, pick, isMcq, rwNow]);

  const next = useCallback((skipped = false) => {
    if (skipped) setResults((r) => [...r, "skip"]);
    setI((n) => n + 1); setPick(""); setChecked(null);
  }, []);

  useEffect(() => { if (q) { headRef.current?.focus({ preventScroll: true }); window.scrollTo({ top: 0 }); } }, [q?.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!q || e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement;
      if (t.closest("[data-calculator]") || t.isContentEditable || t.tagName === "TEXTAREA") return;
      if (e.key === "Escape" && calcOpen) { setCalcOpen(false); return; }
      const typing = t.tagName === "INPUT";
      if (e.key === "Enter") { e.preventDefault(); checked ? next() : check(); return; }
      if (!typing && isMcq && !checked) { const L = e.key.toUpperCase(); if ((LETTERS as readonly string[]).includes(L) && (q.rw ? rwNow?.choices[L] : q.c![LETTERS.indexOf(L as "A")])) setPick(L); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [q, checked, check, next, isMcq, calcOpen, rwNow]);

  if (queue === null) return <main className="mx-auto max-w-3xl px-4 py-10" aria-busy="true"><div className="h-8 w-64 animate-pulse rounded bg-panel" /><div className="mt-6 h-96 animate-pulse rounded-2xl bg-panel" /></main>;

  if (queue.length === 0) {
    return (
      <main className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="text-3xl font-bold">Nothing to practise here yet</h1>
        <p className="mt-3 text-muted">{mode === "missed" ? "You have no missed questions. Every question you get wrong lands here for another go." : "No questions match this station."}</p>
        <Link href={home} className="btn btn-primary mt-6">Back to the map</Link>
      </main>
    );
  }

  const line = lineVar(d);
  const title = mode === "mixed" ? "Mixed set" : mode === "missed" ? "Missed questions" : qParam ? "Single question" : skills[Number(skillParam)]?.name ?? "Practice";

  if (done) {
    const right = results.filter((r) => r === "ok").length;
    const wrong = results.filter((r) => r === "no").length;
    const sk = skillParam !== null ? Number(skillParam) : q ? q.s : null;
    const nextStop = sk !== null && skills[sk] ? (() => { const line = skills.map((s, i) => ({ s, i })).filter(({ s }) => s.domain === skills[sk].domain).map(({ i }) => i); return line[(line.indexOf(sk) + 1) % line.length]; })() : null;
    return (
      <main className="mx-auto max-w-2xl px-4 py-12">
        <h1 ref={headRef} tabIndex={-1} className="text-3xl font-bold outline-none">Set complete</h1>
        <p className="mt-2 text-muted">{title}</p>
        <p className="mt-6 text-5xl font-bold tnum">{right} <span className="text-muted text-2xl font-normal">of {results.length} correct</span></p>
        <Track queue={queue} results={results} i={queue.length} line={line} />
        <div className="mt-8 flex flex-wrap gap-3">
          {!qParam && <button className="btn btn-primary" onClick={() => setRound((n) => n + 1)}>Another set<Arrow /></button>}
          {nextStop !== null && <Link href={`/practice?skill=${nextStop}`} className="btn btn-quiet">Next stop: {skills[nextStop].short}<Arrow /></Link>}
          {wrong > 0 && <Link href="/review" className="btn btn-quiet">Review {wrong} missed</Link>}
          <Link href={home} className="btn btn-quiet">Back to the map</Link>
        </div>
      </main>
    );
  }

  const last = i === queue.length - 1;
  return (
    <main className={`mx-auto max-w-[1000px] px-4 py-6 sm:px-8 ${calcOpen ? "xl:!ml-8 xl:!mr-[480px] xl:!max-w-none" : ""}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="rounded-md px-2.5 py-1 text-sm font-bold shrink-0" style={{ background: line, color: onLineVar(d) }}>{domains[d].short}</span>
          <h1 ref={headRef} tabIndex={-1} className="text-xl font-bold outline-none truncate">{title}</h1>
        </div>
        <div className="flex items-center gap-4">
          <p className="tnum text-muted">Question {i + 1} of {queue.length}</p>
          <button className="btn btn-quiet !min-h-10" onClick={() => setCalcOpen((o) => !o)} aria-expanded={calcOpen} >{calcOpen ? "Hide calculator" : "Calculator"}</button>
        </div>
      </div>
      {queue.length > 1 && <Track queue={queue} results={results} i={i} line={line} />}

      <article className="on-porcelain mt-5 rounded-2xl border-t-[8px] bg-porcelain p-5 text-ink sm:p-8" style={{ borderTopColor: line }} aria-label={`Question ${q!.id}`}>
        <p className="tnum text-sm text-[#4a5878]">{skills[q!.s].short} · ID {q!.id.toUpperCase()}</p>
        <div className="mt-4 space-y-4">
          {q!.rw && content === "error" && <p role="alert" className="rounded-xl bg-[#fbe9e7] p-4 font-bold text-bad">This question could not be loaded. Check your connection and skip to the next one.</p>}
          {q!.rw && !rwNow && content !== "error" && <div aria-busy="true" className="space-y-3"><div className="h-5 w-full animate-pulse rounded bg-[#e8edf8]" /><div className="h-5 w-11/12 animate-pulse rounded bg-[#e8edf8]" /><div className="h-5 w-4/5 animate-pulse rounded bg-[#e8edf8]" /></div>}
          {q!.rw && rwNow?.stem && <div className="max-w-[68ch] space-y-4 text-[1.0625rem] leading-8">{rwNow.stem.map((p, k) => <p key={k}><Rich text={p} /></p>)}</div>}
          {(q!.rw ? (rwNow?.stemImages ? q!.fig ?? [] : []) : q!.stem ?? []).map(([w, h, centre], k) => (
            <Scroll key={k} centre={!!centre}><Pic id={q!.id} part={`stem${k}`} size={[w, h]} alt={k === 0 ? "Question, shown as images" : "Question, continued"} className="block shrink-0" /></Scroll>
          ))}
        </div>

        {q!.rw ? (
          rwNow && (
            <fieldset className="mt-6 space-y-3" disabled={!!checked}>
              <legend className="sr-only">Choose an answer</legend>
              {LETTERS.filter((L) => rwNow.choices[L]).map((L) => {
                const sel = pick === L, right = checked && L === q!.a, wrong = checked && sel && L !== q!.a;
                return (
                  <label key={L} className={`choice flex min-h-14 cursor-pointer items-start gap-4 rounded-xl border-2 px-4 py-3 ${right ? "border-ok bg-[#e6f4ec]" : wrong ? "border-bad bg-[#fbe9e7]" : sel ? "border-ink bg-[#e8edf8]" : "border-[#c9d1e4] hover:border-[#6b7a9e]"}`}>
                    <input type="radio" name="choice" value={L} checked={sel} onChange={() => setPick(L)} className="peer sr-only" />
                    <span aria-hidden className={`mt-0.5 grid size-9 shrink-0 place-items-center rounded-full border-2 font-bold peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink ${right ? "border-ok bg-ok text-white" : wrong ? "border-bad bg-bad text-white" : sel ? "border-ink bg-ink text-white" : "border-ink"}`}>{right ? <Check size={18} /> : wrong ? <Cross size={18} /> : L}</span>
                    <span className="text-[1.0625rem] leading-7"><Rich text={rwNow.choices[L]} /></span>
                    <span className="sr-only">{right ? "Correct answer" : wrong ? "Your answer, incorrect" : ""}</span>
                  </label>
                );
              })}
            </fieldset>
          )
        ) : isMcq ? (
          <fieldset className="mt-6 space-y-3" disabled={!!checked}>
            <legend className="sr-only">Choose an answer</legend>
            {q!.c!.map((sz, k) => {
              const L = LETTERS[k], sel = pick === L, right = checked && L === q!.a, wrong = checked && sel && L !== q!.a;
              return (
                <label key={L} className={`choice flex min-h-14 cursor-pointer items-center gap-4 rounded-xl border-2 px-4 py-3 ${right ? "border-ok bg-[#e6f4ec]" : wrong ? "border-bad bg-[#fbe9e7]" : sel ? "border-ink bg-[#e8edf8]" : "border-[#c9d1e4] hover:border-[#6b7a9e]"}`}>
                  <input type="radio" name="choice" value={L} checked={sel} onChange={() => setPick(L)} className="peer sr-only" />
                  <span aria-hidden className={`grid size-9 shrink-0 place-items-center rounded-full border-2 font-bold peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink ${right ? "border-ok bg-ok text-white" : wrong ? "border-bad bg-bad text-white" : sel ? "border-ink bg-ink text-white" : "border-ink"}`}>{right ? <Check size={18} /> : wrong ? <Cross size={18} /> : L}</span>
                  <Pic id={q!.id} part={L} size={sz} alt={`Choice ${L}, shown as an image`} className="multiply" />
                  <span className="sr-only">{right ? "Correct answer" : wrong ? "Your answer, incorrect" : ""}</span>
                </label>
              );
            })}
          </fieldset>
        ) : (
          <div className="mt-6">
            <label htmlFor="resp" className="block font-bold">Your answer</label>
            <p id="resp-hint" className="text-sm text-[#4a5878]">Enter a number. Fractions like 3/2 and decimals like 1.5 both work.</p>
            <input id="resp" ref={inputRef} inputMode="text" autoComplete="off" spellCheck={false} value={pick} onChange={(e) => setPick(e.target.value)} disabled={!!checked} aria-describedby="resp-hint"
              className={`mt-2 h-14 w-full max-w-xs rounded-xl border-2 bg-white px-4 text-2xl tnum outline-none focus:border-ink focus-visible:outline-ink ${checked === "ok" ? "border-ok" : checked === "no" ? "border-bad" : "border-[#c9d1e4]"}`} />
          </div>
        )}

        <div aria-live="polite" className="mt-6">
          {checked && (
            <div className={`reveal flex items-start gap-3 rounded-xl p-4 font-bold ${checked === "ok" ? "bg-[#e6f4ec] text-ok" : "bg-[#fbe9e7] text-bad"}`}>
              {checked === "ok" ? <Check /> : <Cross />}
              <span>{checked === "ok" ? "Correct." : isMcq ? `Not quite. The correct answer is ${q!.a}.` : `Not quite. Accepted: ${q!.a.split(",").map((s) => s.trim()).join(" or ")}.`}</span>
            </div>
          )}
        </div>

        {checked && q!.rw && rwNow && rwNow.rationale.length > 0 && (
          <details open={checked === "no"} className="reveal group mt-4 rounded-xl border-2 border-[#c9d1e4] p-4">
            <summary className="flex cursor-pointer list-none items-center gap-2 font-bold [&::-webkit-details-marker]:hidden"><Chevron />Rationale</summary>
            <div className="mt-3 max-w-[68ch] space-y-4 leading-7">{rwNow.rationale.map((p, k) => <p key={k}><Rich text={p} /></p>)}</div>
          </details>
        )}
        {checked && !q!.rw && q!.r && (
          <details open={checked === "no"} className="reveal group mt-4 rounded-xl border-2 border-[#c9d1e4] p-4">
            <summary className="flex cursor-pointer list-none items-center gap-2 font-bold [&::-webkit-details-marker]:hidden"><Chevron />Rationale</summary>
            <div className="mt-3"><Scroll><Pic id={q!.id} part="rat" size={q!.r} alt="Worked rationale, shown as an image" className="block shrink-0" /></Scroll></div>
          </details>
        )}

        <div className="sticky bottom-0 -mx-5 -mb-5 mt-6 flex flex-wrap items-center justify-between gap-3 rounded-b-2xl border-t border-[#e1e6f2] bg-porcelain px-5 py-4 sm:-mx-8 sm:-mb-8 sm:px-8">
          {!checked ? <button className="btn btn-quiet-ink" onClick={() => next(true)}>Skip</button> : <span />}
          {!checked ? (
            <button className="btn btn-ink" onClick={check} disabled={!pick.trim()}>Check answer</button>
          ) : (
            <button className="btn btn-ink" onClick={() => next()} autoFocus>{last ? "Finish set" : "Next question"}<Arrow /></button>
          )}
        </div>
      </article>
      <Calculator open={calcOpen} onClose={() => setCalcOpen(false)} />
      <p className="mt-3 text-sm text-muted">{isMcq ? "Keys: A to D choose, Enter checks and continues." : "Enter checks and continues."}</p>
      <button className="mt-1 text-sm text-muted underline underline-offset-4 hover:text-text" onClick={() => router.push(home)}>End set and return to the map</button>
    </main>
  );
}

/** The set drawn as a short line: each question is a stop. */
function Track({ queue, results, i, line }: { queue: Question[]; results: Outcome[]; i: number; line: string }) {
  return (
    <ol className="mt-4 flex items-center" aria-label="Progress through this set">
      {queue.map((q, k) => {
        const r = results[k], here = k === i;
        return (
          <li key={q.id} className="flex flex-1 items-center last:flex-none">
            <span className="grid size-6 place-items-center rounded-full border-[4px] bg-bg text-[10px]" style={{ borderColor: line, background: r ? line : undefined, outline: here ? "3px solid #f4f1e8" : undefined, outlineOffset: 2 }}
              aria-label={`Question ${k + 1}: ${r === "ok" ? "correct" : r === "no" ? "incorrect" : r === "skip" ? "skipped" : here ? "current" : "not yet"}`}>
              {r === "ok" && <Check size={12} className="text-bg" />}
              {r === "no" && <Cross size={12} className="text-bg" />}
            </span>
            {k < queue.length - 1 && <span aria-hidden className="h-[6px] flex-1" style={{ background: line, opacity: k < i ? 1 : 0.35 }} />}
          </li>
        );
      })}
    </ol>
  );
}
