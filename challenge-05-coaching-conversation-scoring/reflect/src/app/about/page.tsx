import { redirect } from "next/navigation";

// About merged into Pitch; keep old links working.
export default function About() {
  redirect("/pitch");
}
