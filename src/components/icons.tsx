type P = { size?: number; className?: string };
const base = (size: number) => ({ width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true });
export const Check = ({ size = 20, className }: P) => (<svg {...base(size)} className={className}><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>);
export const Cross = ({ size = 20, className }: P) => (<svg {...base(size)} className={className}><path d="M6 6l12 12M18 6L6 18" /></svg>);
export const Arrow = ({ size = 20, className }: P) => (<svg {...base(size)} className={className}><path d="M5 12h14M13 6l6 6-6 6" /></svg>);
export const Chevron = ({ size = 18, className }: P) => (<svg {...base(size)} className={`transition-transform duration-150 group-open:rotate-90 ${className ?? ""}`}><path d="M9 6l6 6-6 6" /></svg>);
export const Mark = ({ size = 28 }: P) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
    <path d="M4 8h12l8 8v8" stroke="var(--line-0)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4 16h8l4 4h4" stroke="var(--line-2)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="24" cy="24" r="4" fill="#0d1b3d" stroke="#f4f1e8" strokeWidth="3" />
  </svg>
);
