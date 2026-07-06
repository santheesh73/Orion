import Link from "next/link";
import { WifiOff } from "lucide-react";

export default function OfflinePage() {
  return (
    <main className="grid min-h-[calc(100vh-4rem)] place-items-center px-4 py-16">
      <section className="max-w-xl rounded-lg border border-border bg-card p-6 text-center shadow-soft">
        <div className="mx-auto grid size-12 place-items-center rounded-md bg-warning/10 text-warning">
          <WifiOff className="size-6" />
        </div>
        <h1 className="mt-5 text-heading-3">Orion is running offline</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Cached routes, local chats, documents, settings, and downloaded model assets remain available from browser storage.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Link href="/chat" className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">
            Open chat
          </Link>
          <Link href="/performance" className="inline-flex h-10 items-center justify-center rounded-md border border-border px-4 text-sm font-medium">
            Check status
          </Link>
        </div>
      </section>
    </main>
  );
}
