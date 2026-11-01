"use client";
import { useEffect, useRef, useState } from "react";
import { Cross } from "./icons";

// Desmos's published demo key works for development. Set NEXT_PUBLIC_DESMOS_KEY (free key from desmos.com/api) before deploying.
const KEY = process.env.NEXT_PUBLIC_DESMOS_KEY || "dcb31709b452b1cf9dc26972add0fda6";
const SRC = `https://www.desmos.com/api/v1.11/calculator.js?apiKey=${KEY}`;

type DesmosApi = { GraphingCalculator: (el: HTMLElement, opts?: object) => { resize: () => void; destroy: () => void } };
declare global { interface Window { Desmos?: DesmosApi } }

function load(): Promise<DesmosApi> {
  if (window.Desmos) return Promise.resolve(window.Desmos);
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = SRC; s.async = true;
    s.onload = () => (window.Desmos ? resolve(window.Desmos) : reject(new Error("Desmos missing")));
    s.onerror = () => reject(new Error("Desmos failed to load"));
    document.head.appendChild(s);
  });
}

/** Floating Desmos graphing calculator. Stays mounted while hidden so expressions survive between questions. */
export function Calculator({ open, onClose }: { open: boolean; onClose: () => void }) {
  const host = useRef<HTMLDivElement>(null);
  const calc = useRef<ReturnType<DesmosApi["GraphingCalculator"]> | null>(null);
  const [state, setState] = useState<"idle" | "loading" | "ready" | "error">("idle");

  useEffect(() => {
    if (!open || state !== "idle") return;
    setState("loading");
    load().then((D) => {
      if (!host.current) return;
      calc.current = D.GraphingCalculator(host.current, { keypad: true, expressions: true, settingsMenu: false, zoomButtons: true });
      setState("ready");
    }).catch(() => setState("error"));
  }, [open, state]);

  useEffect(() => { if (open) calc.current?.resize(); }, [open, state]);
  useEffect(() => () => calc.current?.destroy(), []);

  return (
    <section data-calculator hidden={!open} aria-label="Desmos graphing calculator"
      className="fixed inset-x-3 bottom-3 z-30 flex h-[70dvh] flex-col overflow-hidden rounded-2xl border-2 border-rule bg-porcelain shadow-[0_12px_40px_rgba(0,0,0,.45)] sm:inset-x-auto sm:right-4 sm:bottom-4 sm:h-[560px] sm:w-[440px]">
      <div className="flex items-center justify-between bg-panel px-4 py-2">
        <h2 className="font-bold">Calculator</h2>
        <button className="btn btn-quiet !min-h-9 !px-2" onClick={onClose} aria-label="Close calculator"><Cross size={18} /></button>
      </div>
      <div className="relative flex-1 text-ink">
        <div ref={host} className="absolute inset-0" />
        {state === "loading" && <p className="absolute inset-0 grid place-items-center text-[#4a5878]" role="status">Loading calculator…</p>}
        {state === "error" && (
          <p className="absolute inset-0 grid place-items-center p-6 text-center text-bad" role="alert">The Desmos calculator could not load. Check your connection, then close and reopen this panel.</p>
        )}
      </div>
    </section>
  );
}
