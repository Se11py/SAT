---
name: SAT Math Lines
description: A midnight-blue transit diagram where four SAT Math domains are rail lines, skills are stations, and practice is riding to the next stop.
colors:
  midnight-enamel: "#0d1b3d"
  panel: "#12254f"
  panel-raised: "#1a3166"
  rule: "#2a4585"
  ticket-cream: "#f4f1e8"
  signal-muted: "#b4c0de"
  porcelain: "#ffffff"
  line-algebra: "#d93a41"
  line-algebra-text: "#ff8087"
  line-advanced: "#3366d9"
  line-advanced-text: "#86adf5"
  line-data: "#f2a900"
  line-data-text: "#f7c548"
  line-geometry: "#2ca06b"
  line-geometry-text: "#5fd09b"
  correct: "#146c43"
  incorrect: "#b3261e"
  porcelain-rule: "#c9d1e4"
  porcelain-muted: "#4a5878"
  correct-tint: "#e6f4ec"
  incorrect-tint: "#fbe9e7"
  selected-tint: "#e8edf8"
  disabled-ink: "#5a6a8c"
typography:
  display:
    fontFamily: "Atkinson Hyperlegible, ui-sans-serif, system-ui, sans-serif"
    fontSize: "3rem"
    fontWeight: 700
    lineHeight: 1
  headline:
    fontFamily: "Atkinson Hyperlegible, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 700
    lineHeight: 1.2
  title:
    fontFamily: "Atkinson Hyperlegible, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.25
  body:
    fontFamily: "Atkinson Hyperlegible, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Atkinson Hyperlegible, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 700
    lineHeight: 1.43
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
  xl: "12px"
  panel: "16px"
  pill: "9999px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.ticket-cream}"
    textColor: "{colors.midnight-enamel}"
    rounded: "{rounded.lg}"
    padding: "0 20px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.porcelain}"
  button-ink:
    backgroundColor: "{colors.midnight-enamel}"
    textColor: "{colors.porcelain}"
    rounded: "{rounded.lg}"
    padding: "0 20px"
    height: "44px"
  button-ink-hover:
    backgroundColor: "{colors.panel-raised}"
  button-quiet:
    backgroundColor: "transparent"
    textColor: "{colors.ticket-cream}"
    rounded: "{rounded.lg}"
    padding: "0 20px"
    height: "44px"
  panel-card:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ticket-cream}"
    rounded: "{rounded.panel}"
    padding: "24px"
  question-sheet:
    backgroundColor: "{colors.porcelain}"
    textColor: "{colors.midnight-enamel}"
    rounded: "{rounded.panel}"
    padding: "32px"
  choice-row:
    backgroundColor: "{colors.porcelain}"
    textColor: "{colors.midnight-enamel}"
    rounded: "{rounded.xl}"
    padding: "12px 16px"
    height: "56px"
  answer-input:
    backgroundColor: "{colors.porcelain}"
    textColor: "{colors.midnight-enamel}"
    rounded: "{rounded.xl}"
    padding: "0 16px"
    height: "56px"
  line-badge:
    textColor: "{colors.midnight-enamel}"
    rounded: "{rounded.md}"
    padding: "4px 10px"
---

# Design System: SAT Math Lines

## Overview

**Creative North Star: "The Midnight Transit Diagram"**

The app is a night-time rail map. A midnight-blue enamel shell holds everything; the four SAT Math domains are four coloured lines that converge on a central Mixed interchange; the 19 skills are stations along them. Practising is riding to the next stop. Question content, which is black-on-white imagery from the source bank, sits on porcelain-white sheets so it is never altered or tinted by the shell.

Density is calm and roomy: large touch targets, one typeface, few surfaces. Progress is told through the diagram itself (line fill, station state) and never through ring charts or stat tiles. Depth is tonal, with no shadows. Colour carries meaning only when it is a line ink or a right/wrong verdict.

**Key Characteristics:**
- Dark enamel shell, porcelain question sheets: two surfaces, never mixed within one panel.
- Four fixed line inks identify domains everywhere a domain appears.
- Stations are circles; lines bend only at 45 and 90 degrees.
- One humanist sans, bold for hierarchy, tabular figures for every count.
- Standard web controls with a single shared button vocabulary.

## Colors

A deep navy shell lit by cream ink and four signal-lamp line colours, with a plain white sheet for content.

### Primary
- **Ticket Cream** (#f4f1e8): text on the shell, the primary button fill, focus rings, selection, the Mixed hub and the current-stop ring. The single "action" colour on dark.

### Secondary (the four lines)
- **Scarlet Line** (#d93a41): Algebra. Text variant #ff8087 on dark; on-line text white.
- **Cobalt Line** (#3366d9): Advanced Math. Text variant #86adf5; on-line text white.
- **Amber Line** (#f2a900): Problem-Solving and Data Analysis. Text variant #f7c548; on-line text midnight.
- **Signal Green Line** (#2ca06b): Geometry and Trigonometry. Text variant #5fd09b; on-line text midnight.

Line fills (badges, track, diagram strokes) use the base ink with its paired on-line text colour; the lighter "text" variants are for line-coloured type on the dark shell. Declared in `:root` as `--line-N`, `--line-text-N`, `--on-line-N`, indexed by domain order.

### Tertiary (verdicts)
- **Correct Green** (#146c43) on tint #e6f4ec, and **Incorrect Red** (#b3261e) on tint #fbe9e7: only inside the porcelain sheet, always paired with a check or cross icon and words.

### Neutral
- **Midnight Enamel** (#0d1b3d): page background, ink on porcelain, station fill.
- **Panel** (#12254f): cards on the shell. **Panel Raised** (#1a3166): count pills and ink-button hover.
- **Rule** (#2a4585): hairlines, dividers, quiet button borders, scrollbars.
- **Signal Muted** (#b4c0de): secondary text on the shell.
- **Porcelain** (#ffffff): question sheets, inputs, choice rows.
- **Porcelain Rule** (#c9d1e4), **Porcelain Muted** (#4a5878), **Selected Tint** (#e8edf8), **Disabled Ink** (#5a6a8c): quiet borders, secondary text, selection fill and disabled ink button inside or on the porcelain sheet.

### Named Rules
**The Line Ink Rule.** A domain is always shown in its own line colour, and a line colour never appears for anything else.
**The Two Surfaces Rule.** Shell content is cream on navy; question content is navy on porcelain. Only the shell uses `muted`, only the sheet uses the porcelain neutrals.
**The Verdict Pair Rule.** Right and wrong are never colour alone: icon plus sentence plus tint.

## Typography

**Display, Body and Label Font:** Atkinson Hyperlegible (400 and 700, with ui-sans-serif, system-ui fallback), via `next/font`.

**Character:** One hyperlegible humanist sans for every role; hierarchy comes from size and a jump from regular to bold, not from a second face.

### Hierarchy
- **Display** (700, 3rem, 1): the set-complete score only.
- **Headline** (700, 1.875rem, 1.2): page headings on empty and completion states.
- **Title** (700, 1.5rem, 1.25): the suggested skill name in the Next stop panel; 1.25rem bold for the practice heading and product name; 1.125rem bold for panel headings.
- **Body** (400, 1rem, 1.5): descriptions and rationale-adjacent copy; secondary lines in `muted`.
- **Label** (700, 0.875rem): line badges, count pills, hints; 0.875rem regular for helper text. Diagram labels are bold 19px names with 17px regular counts in SVG user units.

### Named Rules
**The Tabular Count Rule.** Every number that can change (solved/total, question index, accuracy, ID) takes `tabular-nums`.
**The Bold Step Rule.** Hierarchy is regular versus bold plus size; no italics, no uppercase tracking, no second face.

## Layout

Max content width 1440px with 16px (32px from the sm breakpoint) side padding. Home is a two-column grid from lg: fluid diagram column plus a fixed 380px sticky right rail (Next stop, Your journey, station key), 32px gap. Below lg the rail moves above the map and the diagram is replaced by LineList: each line as a vertical diagram with 56px minimum rows. Practice is a single 1000px column; completion and empty states narrow to 672px and 576px. The diagram is drawn in a 1000 by 800 viewBox with the hub at the centre. Rhythm is 8, 12, 16, 24, 32px; panels pad 24px, the question sheet 20px (32px from sm). Question images shrink to fit but never below a minimum scale, and scroll sideways inside a focusable box instead.

## Elevation & Depth

Flat. There are no shadows. Depth is tonal: shell, panel (#12254f), raised (#1a3166) on dark, and a white sheet that reads as lifted because it is the only light surface. The sheet carries an 8px top edge in the current line colour. The practice action bar is sticky to the sheet bottom, separated by a 1px hairline.

### Named Rules
**The Flat Enamel Rule.** Surfaces never carry shadows or glow; separation comes from tone, hairline rules, or the line-colour edge.

## Shapes

Soft, consistent rounding: cards and the question sheet 16px; choice rows and inputs 12px; buttons and diagram badges 8px; small badges 6px; stations and choice letters are circles; the Mixed hub is a full pill. Focus corners are 4px. Lines are 12px round-capped strokes in the diagram (40% opacity for stretch not yet travelled, full for reached) and 6px in the set track and mobile list. Station states: hollow ring (not started), ring with centre dot (in progress), filled with check (cleared at 80% solved). The current stop is a dashed cream ring.

## Components

### Buttons
- **Shape:** 8px radius, 44px minimum height, 20px horizontal padding, 2px border, bold.
- **Primary:** cream fill, midnight text; hover goes to white. Used once per view for the main action (Start a set, Another set).
- **Ink:** midnight fill, white text, for the action bar on the porcelain sheet; hover #1a3166; disabled is #5a6a8c.
- **Quiet / Quiet-ink:** transparent with a 2px rule border (cream text on shell, midnight text with #c9d1e4 border on porcelain); border strengthens on hover.
- **Focus:** 3px cream outline, 3px offset (midnight on porcelain). 150ms colour transitions; none under reduced motion.

### Cards / Containers
Panel cards: #12254f, 16px radius, 24px padding, no border, no shadow. Within "Your journey", rows split by Rule hairlines.

### Choice rows and Inputs
Rows are 56px minimum, 2px #c9d1e4 border, 12px radius, a 36px lettered circle, and the answer image multiplied into the white. Selected: midnight border and tint #e8edf8. After checking, correct is green border/tint with a check; chosen-wrong is red with a cross. The numeric input is 56px tall, 24px text, same border logic, focus border midnight.

### Navigation
64px top bar on the shell with a Rule hairline, mark plus bold product name left, Map and Review right. Active tab has a 4px cream underline and cream text; inactive is muted. The Review tab shows a count pill (#1a3166).

### Line Badge
A small rounded chip in the line ink with its on-line text colour, naming the domain. Appears in the Next stop panel, practice header, and diagram line ends (8px radius, 220px by 40px in the SVG).

### Set Track
The set drawn as a short line of stations: one per question, filled with check or cross when answered, outlined with a cream ring when current, the connector fading from full to 35% opacity ahead.

### Reveal
Verdict banner and rationale open with a 220ms clip-path wipe (ease cubic-bezier(.16,1,.3,1)); disabled for reduced motion.

## Do's and Don'ts

### Do:
- **Do** colour any domain reference with its line ink, using the `--on-line-N` text colour on fills and `--line-text-N` for type on navy.
- **Do** keep question images on pure white and blend choice images with multiply.
- **Do** pair every verdict colour with an icon and a sentence.
- **Do** keep one primary (cream) button per view and use quiet buttons for the rest.
- **Do** use tabular figures for all counts and keep 44px minimum targets.
- **Do** keep focus visible: 3px cream ring on shell, midnight on porcelain.
- **Do** respect `prefers-reduced-motion` for every transition and the reveal.

### Don't:
- **Don't** use progress rings, stat tiles, or dashboard cards in place of the diagram.
- **Don't** bend lines at angles other than 45 and 90 degrees, or use non-circular station ticks.
- **Don't** add shadows, glows, or gradients; separate surfaces by tone and hairlines.
- **Don't** introduce a second typeface or a fifth line colour.
- **Don't** put porcelain-sheet neutrals on the shell or shell `muted` text on porcelain.
- **Don't** tint, recolour or crop question imagery.
