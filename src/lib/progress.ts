"use client";
import { useSyncExternalStore } from "react";
import { questions, skillQuestions, subjectOfSkill, type SubjectId } from "./bank";

export type Rec = { n: number; ok: number; last: boolean; ts: number };
export type Store = Record<string, Rec>;

const KEY = "sat.progress.v1";
const LAST = "sat.last-skill.v1";
const EVENT = "sat-progress";
const EMPTY: Store = {};
let cacheRaw: string | null = null;
let cache: Store = EMPTY;

export function readStore(): Store {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw !== cacheRaw) {
      cacheRaw = raw;
      cache = raw ? (JSON.parse(raw) as Store) : EMPTY;
    }
    return cache;
  } catch {
    return EMPTY;
  }
}

function subscribe(cb: () => void) {
  window.addEventListener("storage", cb);
  window.addEventListener(EVENT, cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(EVENT, cb);
  };
}

export const useProgress = () => useSyncExternalStore(subscribe, readStore, () => EMPTY);

export function recordAnswer(id: string, correct: boolean) {
  try {
    const store = { ...readStore() };
    const prev = store[id] ?? { n: 0, ok: 0, last: false, ts: 0 };
    store[id] = { n: prev.n + 1, ok: prev.ok + (correct ? 1 : 0), last: correct, ts: Date.now() };
    localStorage.setItem(KEY, JSON.stringify(store));
    window.dispatchEvent(new Event(EVENT));
  } catch {}
}

export function resetProgress() {
  try {
    localStorage.removeItem(KEY);
    localStorage.removeItem(LAST);
    window.dispatchEvent(new Event(EVENT));
  } catch {}
}

export const setLastSkill = (s: number) => { try { localStorage.setItem(LAST, String(s)); } catch {} };
export const getLastSkill = (): number | null => {
  try { const v = localStorage.getItem(LAST); return v === null ? null : Number(v); } catch { return null; }
};

export type SkillStat = { total: number; solved: number; attempted: number; state: "none" | "started" | "cleared" };
export const CLEARED_AT = 0.8;

export function skillStat(store: Store, skill: number): SkillStat {
  const qs = skillQuestions[skill];
  let solved = 0, attempted = 0;
  for (const q of qs) {
    const r = store[q.id];
    if (r) { attempted++; if (r.last) solved++; }
  }
  const state = attempted === 0 ? "none" : solved / qs.length >= CLEARED_AT ? "cleared" : "started";
  return { total: qs.length, solved, attempted, state };
}

export function totals(store: Store, subject?: SubjectId) {
  let solved = 0, n = 0, ok = 0, missed = 0, count = 0;
  for (const q of questions) {
    if (subject && subjectOfSkill(q.s) !== subject) continue;
    count++;
    const r = store[q.id];
    if (!r) continue;
    n += r.n; ok += r.ok;
    if (r.last) solved++; else missed++;
  }
  return { solved, missed, count, accuracy: n ? Math.round((ok / n) * 100) : null, answered: n };
}
