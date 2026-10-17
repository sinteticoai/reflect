import { Analyzer, type DemoCall } from "@/components/Analyzer";
import demoData from "@/data/demo-calls.json";

export default function Home() {
  const raw: unknown = demoData;
  const demos = (Array.isArray(raw) ? raw : []).filter(
    (d): d is DemoCall => !!d && typeof d === "object" && Array.isArray((d as DemoCall).lines),
  );
  return <Analyzer demos={demos} />;
}
