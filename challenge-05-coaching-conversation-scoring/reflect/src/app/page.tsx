import { Analyzer, type DemoCall } from "@/components/Analyzer";
import demoData from "@/data/demo-calls.json";

// The safety call makes the strongest first impression, so it opens by default.
const FIRST_DEMO = "CALL05423";

export default function Home() {
  const raw: unknown = demoData;
  const demos = (Array.isArray(raw) ? raw : [])
    .filter((d): d is DemoCall => !!d && typeof d === "object" && Array.isArray((d as DemoCall).lines))
    .sort((a, b) => Number(b.id === FIRST_DEMO) - Number(a.id === FIRST_DEMO));
  return <Analyzer demos={demos} />;
}
