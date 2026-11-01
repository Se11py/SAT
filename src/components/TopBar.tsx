"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mark } from "./icons";
import { totals, useProgress } from "@/lib/progress";

export function TopBar() {
  const path = usePathname();
  const missed = totals(useProgress()).missed;
  const link = (href: string, label: string, active: boolean, count?: number, short?: string) => (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`px-2 sm:px-3 h-16 inline-flex items-center gap-2 font-bold whitespace-nowrap border-b-4 ${active ? "border-text text-text" : "border-transparent text-muted hover:text-text"}`}
    >
      {short ? <><span className="hidden sm:inline">{label}</span><span className="sm:hidden" aria-hidden>{short}</span><span className="sr-only sm:hidden">{label}</span></> : label}
      {count ? <span className="tnum text-sm rounded-full bg-panel-2 px-2 py-0.5 text-text">{count}</span> : null}
    </Link>
  );
  return (
    <header className="border-b border-rule bg-bg">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-3 sm:px-8">
        <Link href="/" className="flex items-center gap-2 whitespace-nowrap text-xl font-bold sm:gap-3" aria-label="SAT Lines, home">
          <Mark />
          SAT Lines
        </Link>
        <nav aria-label="Primary" className="flex">
          {link("/", "Math", path === "/")}
          {link("/reading-writing", "Reading & Writing", path === "/reading-writing", undefined, "R&W")}
          {link("/review", "Review", path === "/review", missed)}
        </nav>
      </div>
    </header>
  );
}
