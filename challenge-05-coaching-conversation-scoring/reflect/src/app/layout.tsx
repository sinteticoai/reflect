import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Reflect | Coaching call review",
  description: "Every coaching call, reviewed like a supervisor would.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}>
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
            <Link href="/" className="flex items-baseline gap-3">
              <span className="text-xl font-semibold tracking-tight text-teal-800">Reflect</span>
              <span className="hidden text-sm text-slate-500 sm:inline">
                Every coaching call, reviewed like a supervisor would.
              </span>
            </Link>
            <nav className="flex gap-1 text-sm">
              <Link href="/" className="rounded-md px-3 py-1.5 text-slate-700 hover:bg-slate-100">Analyze</Link>
              <Link href="/validation" className="rounded-md px-3 py-1.5 text-slate-700 hover:bg-slate-100">Validation</Link>
              <Link href="/about" className="rounded-md px-3 py-1.5 text-slate-700 hover:bg-slate-100">About</Link>
              <Link href="/pitch" className="rounded-md px-3 py-1.5 text-slate-700 hover:bg-slate-100">Pitch</Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
