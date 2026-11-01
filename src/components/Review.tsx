"use client";
import Link from "next/link";
import { useState } from "react";
import { domains, lineVar, onLineVar, questions, skills, subjects } from "@/lib/bank";
import { resetProgress, totals, useProgress } from "@/lib/progress";
import { Arrow } from "./icons";

export function Review() {
  const store = useProgress();
  const [confirm, setConfirm] = useState(false);
  const missed = questions.filter((q) => store[q.id] && !store[q.id].last);
  const t = totals(store);
  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-8">
      <h1 className="text-3xl font-bold">Review</h1>
      {missed.length === 0 ? (
        <section className="mt-6 rounded-2xl bg-panel p-8">
          <h2 className="text-xl font-bold">No missed questions</h2>
          <p className="mt-2 text-muted">{t.answered === 0 ? "Answer a few questions and any you get wrong will collect here, grouped by line, so you can retry them." : "Everything you have answered is currently correct. Pick another station and keep going."}</p>
          <Link href="/" className="btn btn-primary mt-5">Open the map</Link>
        </section>
      ) : (
        <>
          <p className="mt-2 text-muted tnum">{missed.length} missed, grouped by line. Retrying one that you get right clears it.</p>
          <Link href="/practice?mode=missed" className="btn btn-primary mt-4">Practise all {missed.length} missed<Arrow /></Link>
          <div className="mt-8 space-y-8">
            {domains.map((dom, d) => {
              const rows = missed.filter((q) => skills[q.s].domain === d);
              if (!rows.length) return null;
              return (
                <section key={dom.id} aria-labelledby={`h-${dom.id}`}>
                  <h2 id={`h-${dom.id}`} className="inline-block rounded-lg px-3 py-1.5 font-bold" style={{ background: lineVar(d), color: onLineVar(d) }}>{subjects.find((s) => s.id === dom.subject)!.short} · {dom.name} <span className="tnum font-normal">({rows.length})</span></h2>
                  <ul className="mt-3 divide-y divide-rule rounded-2xl bg-panel">
                    {rows.map((q) => (
                      <li key={q.id}>
                        <Link href={`/practice?q=${q.id}`} className="flex min-h-14 items-center justify-between gap-4 px-5 py-3 hover:bg-panel-2 first:rounded-t-2xl last:rounded-b-2xl">
                          <span><span className="font-bold">{skills[q.s].short}</span><span className="tnum ml-3 text-sm text-muted">ID {q.id.toUpperCase()}</span></span>
                          <span className="tnum text-sm text-muted shrink-0">{store[q.id].ok} right of {store[q.id].n}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
        </>
      )}
      {t.answered > 0 && (
        <section className="mt-12 border-t border-rule pt-6">
          <h2 className="font-bold">Reset progress</h2>
          <p className="mt-1 text-sm text-muted">Progress lives in this browser only. Resetting clears every answer and cannot be undone.</p>
          {!confirm ? (
            <button className="btn btn-quiet mt-3" onClick={() => setConfirm(true)}>Reset all progress</button>
          ) : (
            <div className="mt-3 flex gap-3">
              <button className="btn btn-primary" onClick={() => { resetProgress(); setConfirm(false); }}>Yes, clear everything</button>
              <button className="btn btn-quiet" onClick={() => setConfirm(false)}>Keep my progress</button>
            </div>
          )}
        </section>
      )}
    </main>
  );
}
