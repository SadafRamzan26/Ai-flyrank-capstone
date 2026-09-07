import StreamingChat from "@/components/StreamingChat";

export const metadata = {
  title: "Mine AI — Streaming AI Chat Interface",
  description:
    "Real-time streaming AI chat interface powered by Mine AI.",
};

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-0">
      <StreamingChat />
    </main>
  );
}
