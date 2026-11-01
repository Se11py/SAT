import type { Metadata } from "next";
import { Atkinson_Hyperlegible } from "next/font/google";
import { TopBar } from "@/components/TopBar";
import "./globals.css";

const atkinson = Atkinson_Hyperlegible({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-atkinson" });

export const metadata: Metadata = {
  title: "SAT Lines",
  description: "Practice 1,220 hard SAT Math and Reading & Writing questions, one station at a time.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={atkinson.variable}>
      <body className="min-h-dvh flex flex-col">
        <TopBar />
        <div className="flex-1">{children}</div>
      </body>
    </html>
  );
}
