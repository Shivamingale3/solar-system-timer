import Scene from "@/components/Scene";
import TimerOverlay from "@/components/TimerOverlay";

export default function Home() {
  return (
    <main className="relative w-full h-screen overflow-hidden bg-[#050510]">
      <Scene />
      <TimerOverlay />
    </main>
  );
}
