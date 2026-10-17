const STATS = [
  ["83%", "agreement with MI experts on real sessions", "Experts agree with each other 84%"],
  ["37 / 37", "urgent safety issues caught", "Zero false alarms"],
  ["r 0.74", "match to supervisor scores", "Supervisors match each other at 0.68"],
];

export function Proof({ size = "lg" }: { size?: "md" | "lg" }) {
  const big = size === "lg" ? "text-6xl" : "text-5xl";
  return (
    <div className="grid gap-6 sm:grid-cols-3">
      {STATS.map(([n, what, ref]) => (
        <div key={n} className="border-l-4 border-teal-600 pl-4">
          <p className={`${big} font-semibold tracking-tight text-teal-700`}>{n}</p>
          <p className="mt-2 text-lg font-medium text-slate-800">{what}</p>
          <p className="mt-1 text-sm text-slate-500">{ref}</p>
        </div>
      ))}
    </div>
  );
}
