"use client";
import Link from "next/link";
import { domains, domainsOfSubject, lineVar, onLineVar, skills, skillsOfDomain, subjectQuestions, type SubjectId } from "@/lib/bank";
import { skillStat, type Store } from "@/lib/progress";
import { Check } from "./icons";

const W = 1000, H = 800, HUB = { x: 500, y: 400 };
const GEO = [
  { side: -1, dir: -1 }, // first line: left, up
  { side: 1, dir: -1 }, // second: right, up
  { side: 1, dir: 1 }, // third: right, down
  { side: -1, dir: 1 }, // fourth: left, down
];

function Station({ x, y, skill, store, d, side, next }: { x: number; y: number; skill: number; store: Store; d: number; side: number; next: boolean }) {
  const st = skillStat(store, skill);
  const label = `${skills[skill].short}, ${st.solved} of ${st.total} solved${st.state === "cleared" ? ", cleared" : ""}`;
  const anchor = side < 0 ? "end" : "start";
  const tx = x + side * 28;
  return (
    <Link href={`/practice?skill=${skill}`} className="station" aria-label={label}>
      <rect x={side < 0 ? x - 400 : x - 20} y={y - 18} width={420} height={36} fill="transparent" />
      {next && <circle cx={x} cy={y} r={20} fill="none" stroke="#f4f1e8" strokeWidth={3} strokeDasharray="5 5" />}
      <circle className="ring" cx={x} cy={y} r={11} fill={st.state === "cleared" ? lineVar(d) : "#0d1b3d"} stroke={lineVar(d)} strokeWidth={5} />
      {st.state === "started" && <circle cx={x} cy={y} r={5.5} fill={lineVar(d)} />}
      {st.state === "cleared" && <path d={`M${x - 5} ${y} l3.5 3.5 l6.5 -7`} stroke={onLineVar(d)} strokeWidth={2.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />}
      <text x={tx} y={y + 6} textAnchor={anchor} fontSize={19}>
        <tspan className="label-name" fill="#f4f1e8" fontWeight={700}>{skills[skill].short}</tspan>
        <tspan className="tnum" fill="#b4c0de" dx={10} fontSize={17}>{st.solved}/{st.total}</tspan>
      </text>
    </Link>
  );
}

export function Diagram({ store, next, subject }: { store: Store; next: number; subject: SubjectId }) {
  const doms = domainsOfSubject(subject);
  const count = subjectQuestions(subject).length;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="group" aria-label="Network map: four lines, one per domain, with a station for each skill">
      {doms.map((d, li) => {
        const dom = domains[d];
        const { side, dir } = GEO[li];
        const ids = skillsOfDomain(d);
        const cornerY = HUB.y + dir * 90, cornerX = HUB.x + side * 90, endY = dir < 0 ? 70 : H - 70;
        const path = `M${HUB.x} ${HUB.y} L${cornerX} ${cornerY} L${cornerX} ${endY}`;
        const step = ids.length > 1 ? (endY - cornerY) / (ids.length - 1) : 0;
        const badgeY = dir < 0 ? 8 : H - 48;
        const reached = ids.reduce((m, i, k) => (skillStat(store, i).state !== "none" ? k : m), -1);
        const total = ids.reduce((n, i) => n + skillStat(store, i).total, 0);
        const solved = ids.reduce((n, i) => n + skillStat(store, i).solved, 0);
        return (
          <g key={dom.id}>
            <path d={path} stroke={lineVar(d)} strokeOpacity={0.4} strokeWidth={12} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            {reached >= 0 && <path d={`M${HUB.x} ${HUB.y} L${cornerX} ${cornerY} L${cornerX} ${cornerY + step * reached}`} stroke={lineVar(d)} strokeWidth={12} fill="none" strokeLinecap="round" strokeLinejoin="round" />}
            <g transform={`translate(${side < 0 ? cornerX - 210 : cornerX - 10} ${badgeY})`}>
              <rect width={220} height={40} rx={8} fill={lineVar(d)} />
              <text x={110} y={26} textAnchor="middle" fontSize={18} fontWeight={700} fill={onLineVar(d)}>{dom.short}</text>
            </g>
            <title>{`${dom.name}: ${solved} of ${total} solved`}</title>
            {ids.map((skill, k) => (
              <Station key={skill} x={cornerX} y={cornerY + step * k} skill={skill} store={store} d={d} side={side} next={skill === next} />
            ))}
          </g>
        );
      })}
      <Link href={`/practice?mode=mixed&subject=${subject}`} className="station" aria-label={`Mixed set, all ${count} questions`}>
        <rect x={HUB.x - 70} y={HUB.y - 28} width={140} height={56} rx={28} fill="#f4f1e8" stroke="#0d1b3d" strokeWidth={5} className="ring" />
        <text x={HUB.x} y={HUB.y + 7} textAnchor="middle" fontSize={20} fontWeight={700} fill="#0d1b3d" className="label-name">Mixed set</text>
      </Link>
    </svg>
  );
}

/** Narrow screens: each line drawn as a vertical line diagram. */
export function LineList({ store, next, subject }: { store: Store; next: number; subject: SubjectId }) {
  return (
    <div className="space-y-8">
      <Link href={`/practice?mode=mixed&subject=${subject}`} className="btn btn-primary w-full">Mixed set: all {subjectQuestions(subject).length} questions</Link>
      {domainsOfSubject(subject).map((d) => (
        <section key={domains[d].id} aria-label={domains[d].name}>
          <h2 className="inline-block rounded-lg px-3 py-1.5 text-lg font-bold" style={{ background: lineVar(d), color: onLineVar(d) }}>{domains[d].name}</h2>
          <ol className="mt-3 ml-4">
            {skillsOfDomain(d).map((skill, k, arr) => {
              const reachedIdx = arr.reduce((m, i, kk) => (skillStat(store, i).state !== "none" ? kk : m), -1);
              const st = skillStat(store, skill);
              return (
                <li key={skill} className="relative pl-9">
                  <span aria-hidden className="absolute left-[7px] w-[6px]" style={{ background: lineVar(d), opacity: k <= reachedIdx ? 1 : 0.4, top: k === 0 ? "50%" : 0, bottom: k === arr.length - 1 ? "50%" : 0 }} />
                  <span aria-hidden className="absolute left-0 top-1/2 -mt-[10px] grid size-5 place-items-center rounded-full border-[5px] bg-bg" style={{ borderColor: lineVar(d), background: st.state === "cleared" ? lineVar(d) : undefined, color: onLineVar(d) }}>
                    {st.state === "started" && <span className="size-2 rounded-full" style={{ background: lineVar(d) }} />}
                    {st.state === "cleared" && <Check size={10} />}
                  </span>
                  <Link href={`/practice?skill=${skill}`} className="flex min-h-14 items-center justify-between gap-4 py-2 hover:underline underline-offset-4">
                    <span className="font-bold">{skills[skill].short}{skill === next && <span className="ml-2 rounded border border-text px-1.5 py-0.5 text-xs font-bold">Next</span>}</span>
                    <span className="tnum text-muted">{st.solved}/{st.total}</span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}
