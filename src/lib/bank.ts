import raw from "@/data/bank.json";

export type SubjectId = "math" | "rw";
export type Subject = { id: SubjectId; name: string; short: string; path: string };
export type Domain = { id: string; name: string; short: string; subject: SubjectId; line: number };
export type Skill = { name: string; short: string; domain: number };
export type Size = [number, number];
/** Stem bands: [width, height, centred] in image px; figures are centred, text is left-aligned. */
export type Band = [number, number, 0 | 1];
/** Math questions carry their image sizes. Reading and Writing questions (rw: 1) load their text on demand; `fig` is set when the stem is an image. */
export type Question = { id: string; s: number; a: string; stem?: Band[]; c?: Size[]; r?: Size; rw?: 1; fig?: Band[] };

export const subjects = raw.subjects as Subject[];
export const domains = raw.domains as Domain[];
export const skills = raw.skills as Skill[];
export const questions = raw.questions as Question[];

export const LETTERS = ["A", "B", "C", "D"] as const;
export const SET_SIZE = 10;

export const skillQuestions = skills.map((_, i) => questions.filter((q) => q.s === i));
export const skillsOfDomain = (d: number) => skills.map((s, i) => ({ s, i })).filter(({ s }) => s.domain === d).map(({ i }) => i);
export const domainsOfSubject = (id: SubjectId) => domains.map((d, i) => ({ d, i })).filter(({ d }) => d.subject === id).map(({ i }) => i);
export const subjectOfSkill = (s: number) => domains[skills[s].domain].subject;
export const subjectQuestions = (id: SubjectId) => questions.filter((q) => subjectOfSkill(q.s) === id);
export const byId = new Map(questions.map((q) => [q.id, q]));

/** Line colours come from CSS variables; a domain keeps one line ink within its subject. */
export const lineVar = (d: number) => `var(--line-${domains[d].line})`;
export const onLineVar = (d: number) => `var(--on-line-${domains[d].line})`;
export const lineTextVar = (d: number) => `var(--line-text-${domains[d].line})`;

export const img = (id: string, part: string) => `/bank/img/${id}-${part}.webp`;
/** CSS size for an image rendered at 144dpi: 1 css px per image px reads at ~17px body text. */
export const SCALE = 1;
/** Below this scale text is unreadable, so narrow screens scroll sideways instead of shrinking further. */
export const MIN_SCALE = 0.62;
