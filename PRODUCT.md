# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js + Tailwind (user's choice). Question data is bundled with the app; learner progress is stored in the browser (no accounts decided).

## Users

Solo students, typically high-schoolers preparing for the SAT, practising on their own in short sessions on laptop or phone. Their job: pick questions by skill and difficulty, attempt them, check the answer, and learn from the rationale.

## Product Purpose

A practice platform for SAT Math questions. It turns a 610-question bank export into something a student can drill, review, and track. Success: a student can quickly get to the right set of questions, answer, see whether they were right, and understand why.

## Positioning

Not yet established. The user has not stated a differentiator beyond practising from this specific question bank. Do not invent one.

## Operating Context

- Source content is two PDF exports of the College Board-style question bank, both dated 2026-10-28:
  - Questions: `/Users/phil/Downloads/questionbank-export-2026-10-28-1.pdf` (610 pages, one question per page).
  - Answers: `/Users/phil/Downloads/questionbank-export-2026-10-28-2.pdf` (642 pages; some rationales run past one page).
- Each question carries: Question ID (8-char hex), Assessment (SAT), Test (Math), Domain, Skill, Difficulty (e.g. Hard).
- Questions are multiple-choice (A to D) or student-produced response (a typed numeric answer). The answer PDF adds the correct answer and a rationale.
- Math (equations, graphs, tables) is stored as glyphs and figures, not extractable text.

## Capabilities and Constraints

- Content ingestion: render each question and rationale from the PDFs as cropped images (user's choice), paired with metadata extracted as text (ID, domain, skill, difficulty, correct answer). Upgrading to KaTeX text later is open.
- Rendering requires a one-time tool install (poppler or PyMuPDF), run in a throwaway environment.
- Undecided: accounts and sync, progress tracking depth, timed or full-length test modes, scoring or score prediction, deployment target.

## Evidence on Hand

- The two PDFs above, 610 questions in total. No usage data, user research, brand assets, or name for the product exist yet; future work must not fabricate any.
- Question content originates from a third-party question bank. Licensing and redistribution terms are not confirmed.

## Product Principles

- Practice is the product: the shortest path from opening the app to attempting a question.
- Source fidelity: math and figures shown exactly as in the bank, never altered or approximated.
- Immediate, honest feedback: right or wrong, the correct answer, and the full rationale.
- Respect the student's time: short sessions, resumable, no friction before the first question.

## Accessibility & Inclusion

No product-specific requirement established. Because questions are images, meaningful alt text or an accessible text alternative is an open item to resolve when transcription is considered.
