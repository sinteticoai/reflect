import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { parse } from "csv-parse/sync";
import { analyzeCall, type Analysis, type Line } from "../src/lib/mi";

export const DATA = "../data";
export function csv(path: string): Record<string, string>[] {
  return parse(readFileSync(`${DATA}/${path}`), { columns: true, skip_empty_lines: true });
}
export function groupBy<T>(xs: T[], k: (x: T) => string): Map<string, T[]> {
  const m = new Map<string, T[]>();
  for (const x of xs) { const key = k(x); if (!m.has(key)) m.set(key, []); m.get(key)!.push(x); }
  return m;
}
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
mkdirSync("scripts/out/cache", { recursive: true });

// Cached, retrying analysis so reruns are free.
export async function analyzeCached(key: string, lines: Line[], model: string): Promise<Analysis | null> {
  const f = `scripts/out/cache/${model}__${key}.json`;
  if (existsSync(f)) return JSON.parse(readFileSync(f, "utf8"));
  for (let i = 0; i < 4; i++) {
    try {
      const a = await analyzeCall(lines, { model });
      writeFileSync(f, JSON.stringify(a));
      return a;
    } catch (e: any) {
      const s = e?.status;
      console.error("err", key, s, String(e?.message).slice(0, 120));
      await sleep(s === 429 || s === 529 ? 5000 * (i + 1) : 2000);
    }
  }
  return null;
}
export async function pool<T, R>(items: T[], n: number, fn: (x: T, i: number) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length); let next = 0;
  await Promise.all(Array.from({ length: n }, async () => {
    while (next < items.length) { const i = next++; out[i] = await fn(items[i], i); }
  }));
  return out;
}
// Seeded shuffle for reproducible samples.
export function sample<T>(xs: T[], n: number, seed = 7): T[] {
  const a = [...xs]; let s = seed;
  for (let i = a.length - 1; i > 0; i--) { s = (s * 9301 + 49297) % 233280; const j = Math.floor((s / 233280) * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a.slice(0, n);
}
export function kappa(pairs: [string, string][]): number {
  const n = pairs.length; if (!n) return NaN;
  const cats = [...new Set(pairs.flat())];
  const po = pairs.filter(([a, b]) => a === b).length / n;
  let pe = 0;
  for (const c of cats) pe += (pairs.filter((p) => p[0] === c).length / n) * (pairs.filter((p) => p[1] === c).length / n);
  return Math.round(((po - pe) / (1 - pe)) * 1000) / 1000;
}
export const acc = (pairs: [string, string][]) => pairs.length ? Math.round((1000 * pairs.filter(([a, b]) => a === b).length) / pairs.length) / 10 : NaN;
export function topErrors(pairs: [string, string][], k = 6) {
  const m = new Map<string, number>();
  for (const [t, p] of pairs) if (t !== p) m.set(`${t} -> ${p}`, (m.get(`${t} -> ${p}`) ?? 0) + 1);
  return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, k).map(([e, n]) => ({ error: e, n }));
}
