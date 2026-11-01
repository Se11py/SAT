"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { domains, lineVar, onLineVar, SET_SIZE, skills, subjectOfSkill, subjects, type SubjectId } from "@/lib/bank";
import { getLastSkill, skillStat, totals, useProgress, type Store } from "@/lib/progress";
import { Diagram, LineList } from "./Diagram";
import { Arrow } from "./icons";

function suggest(store: Store, last: number | null, subject: SubjectId): number {
  if (last !== null && subjectOfSkill(last) === subject && skillStat(store, last).state !== "cleared") return last;
  const mine = skills.map((_, i) => i).filter((i) => subjectOfSkill(i) === subject);
  const open = mine.filter((i) => skillStat(store, i).state !== "cleared");
  const started = open.find((i) => skillStat(store, i).state === "started");
  return started ?? open[0] ?? mine[0];
}

export function Home({ subject }: { subject: SubjectId }) {
  const store = useProgress();
  const [last, setLast] = useState<number | null>(null);
  useEffect(() => setLast(getLastSkill()), []);
  const t = totals(store, subject);
  const tAll = totals(store);
  const next = suggest(store, last, subject);
  const name = subjects.find((s) => s.id === subject)!.name;
  const st = skillStat(store, next);
  const d = skills[next].domain;
  const fresh = t.answered === 0;

  return (
    <main className="mx-auto grid max-w-[1440px] gap-8 px-4 py-6 sm:px-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:py-8">
      <h1 className="sr-only">Map of SAT {name} skills</h1>
      <section aria-label="Skill map" className="order-2 lg:order-1">
        <div className="hidden lg:block rounded-2xl bg-panel p-6"><Diagram store={store} next={next} subject={subject} /></div>
        <div className="lg:hidden"><LineList store={store} next={next} subject={subject} /></div>
      </section>

      <aside className="order-1 lg:order-2 lg:sticky lg:top-8 lg:self-start space-y-6">
        <section className="rounded-2xl bg-panel p-6" aria-labelledby="next-h">
          <h2 id="next-h" className="text-lg font-bold">{fresh ? "Where to start" : "Next stop"}</h2>
          <div className="mt-4 flex items-start gap-3">
            <span className="mt-1 shrink-0 rounded-md px-2.5 py-1 text-sm font-bold" style={{ background: lineVar(d), color: onLineVar(d) }}>{domains[d].short}</span>
            <p className="text-2xl font-bold leading-tight text-balance">{skills[next].name}</p>
          </div>
          <p className="mt-2 text-muted tnum">{st.solved} of {st.total} solved{st.attempted > st.solved ? `, ${st.attempted - st.solved} to retry` : ""}</p>
          <Link href={`/practice?skill=${next}`} className="btn btn-primary mt-5 w-full">Start a set of {SET_SIZE}<Arrow /></Link>
          <p className="mt-3 text-sm text-muted">Or pick any station, or take a Mixed set across all four lines. The dashed ring marks this stop.</p>
        </section>

        <section className="rounded-2xl bg-panel p-6" aria-labelledby="journey-h">
          <h2 id="journey-h" className="text-lg font-bold">Your journey</h2>
          <dl className="mt-3 divide-y divide-rule">
            <div className="flex justify-between py-3"><dt className="text-muted">Solved</dt><dd className="tnum font-bold">{t.solved} of {t.count}</dd></div>
            <div className="flex justify-between py-3"><dt className="text-muted">Accuracy</dt><dd className="tnum font-bold">{t.accuracy === null ? "Not yet" : `${t.accuracy}%`}</dd></div>
            <div className="flex justify-between py-3"><dt className="text-muted">Missed, to review</dt><dd className="tnum font-bold">{tAll.missed}</dd></div>
          </dl>
          {tAll.missed > 0 && <Link href="/review" className="btn btn-quiet mt-2 w-full">Review missed questions</Link>}
        </section>

        <section className="px-1" aria-label="Station key">
          <h2 className="sr-only">Station key</h2>
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
            <li className="flex items-center gap-2"><span className="size-4 rounded-full border-4 border-text" />Not started</li>
            <li className="flex items-center gap-2"><span className="grid size-4 place-items-center rounded-full border-4 border-text"><span className="size-1 rounded-full bg-text" /></span>In progress</li>
            <li className="flex items-center gap-2"><span className="size-4 rounded-full border-4 border-text bg-text" />Cleared (80% solved)</li>
          </ul>
        </section>
      </aside>
    </main>
  );
}
