"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  ["/pitch", "Pitch"],
  ["/analyze", "Analyze a call"],
  ["/queue", "Supervisor queue"],
  ["/validation", "Validation"],
];

// Same active style as the selected source tab on the Analyze page.
export function NavLinks() {
  const path = usePathname();
  return (
    <nav className="flex gap-1 text-sm">
      {LINKS.map(([href, label]) => (
        <Link
          key={href}
          href={href}
          className={`rounded-md px-3 py-1.5 ${
            path === href ? "bg-teal-700 text-white" : "text-slate-700 hover:bg-slate-100"
          }`}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
