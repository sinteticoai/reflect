"use client";
import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

// Fixed bottom-right arrow that scrolls the pitch container to the next slide.
export function NextSlide({ containerId }: { containerId: string }) {
  const [hasNext, setHasNext] = useState(true);

  function nextSection(): HTMLElement | null {
    const c = document.getElementById(containerId);
    if (!c) return null;
    const top = c.getBoundingClientRect().top;
    const secs = Array.from(c.querySelectorAll<HTMLElement>("section"));
    return secs.find((s) => s.getBoundingClientRect().top > top + 10) ?? null;
  }

  useEffect(() => {
    const c = document.getElementById(containerId);
    if (!c) return;
    const update = () => setHasNext(!!nextSection() && c.scrollTop + c.clientHeight < c.scrollHeight - 10);
    update();
    c.addEventListener("scroll", update);
    window.addEventListener("resize", update);
    return () => {
      c.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerId]);

  if (!hasNext) return null;
  return (
    <button
      aria-label="Next slide"
      onClick={() => {
        const c = document.getElementById(containerId);
        const n = nextSection();
        if (c && n) c.scrollTo({ top: c.scrollTop + n.getBoundingClientRect().top - c.getBoundingClientRect().top, behavior: "smooth" });
      }}
      className="fixed bottom-6 right-6 z-10 animate-bounce rounded-full border border-slate-200 bg-white p-3 text-slate-500 shadow-sm hover:text-teal-700"
    >
      <ChevronDown size={24} />
    </button>
  );
}
