"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

const LINKS = [
  ["/pitch", "Pitch"],
  ["/analyze", "Analyze a call"],
  ["/queue", "Supervisor queue"],
  ["/validation", "Validation"],
];

// Same active style as the selected source tab on the Analyze page.
// Below md the links collapse into a hamburger menu.
export function NavLinks() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);

  const cls = (href: string) =>
    `rounded-md px-3 py-1.5 ${path === href ? "bg-teal-700 text-white" : "text-slate-700 hover:bg-slate-100"}`;

  return (
    <>
      <nav className="hidden gap-1 text-sm md:flex">
        {LINKS.map(([href, label]) => (
          <Link key={href} href={href} className={cls(href)}>
            {label}
          </Link>
        ))}
      </nav>
      <button
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="rounded-md p-2 text-slate-700 hover:bg-slate-100 md:hidden"
      >
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>
      {open && (
        <nav className="absolute inset-x-0 top-full z-20 flex flex-col gap-1 border-b border-slate-200 bg-white p-3 text-base shadow-sm md:hidden">
          {LINKS.map(([href, label]) => (
            <Link key={href} href={href} className={cls(href)}>
              {label}
            </Link>
          ))}
        </nav>
      )}
    </>
  );
}
