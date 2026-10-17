import { redirect } from "next/navigation";

// The app opens on the pitch.
export default function Home() {
  redirect("/pitch");
}
