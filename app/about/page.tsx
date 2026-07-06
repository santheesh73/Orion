import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Database, Github, Lock, MonitorSmartphone, ShieldCheck, Sparkles, WifiOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { siteConfig } from "@/lib/constants/site";

export const metadata: Metadata = {
  title: "About Orion - Private On-Device AI",
  description: "Learn how Orion keeps AI inference, documents, chats, and settings local to your device."
};

const principles = [
  { icon: Lock, title: "Private by default", copy: "No cloud inference endpoint is required for the local model path." },
  { icon: WifiOff, title: "Offline first", copy: "The app is designed to keep working after setup and model download." },
  { icon: Database, title: "Local memory", copy: "Chats, documents, and preferences are organized around browser storage." },
  { icon: MonitorSmartphone, title: "Installable shell", copy: "The PWA-ready interface feels native across desktop, tablet, and mobile." }
];

export default function AboutPage() {
  return (
    <div className="px-4 pb-24 pt-8 sm:px-6 lg:pb-12">
      <div className="mx-auto max-w-6xl">
        <Badge className="gap-2">
          <Sparkles className="size-3.5" />
          {siteConfig.hackathon}
        </Badge>
        <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_0.72fr] lg:items-end">
          <div>
            <h1 className="text-[clamp(2.25rem,4vw,3.5rem)] font-[650] leading-[1.05] tracking-normal">About Orion</h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
              Orion is a premium, offline-first AI assistant shell built for on-device inference. It uses WebLLM,
              WebGPU, Web Workers, and local browser storage to keep the product boundary simple: your workspace stays
              on your machine.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
            <div className="flex items-center gap-3">
              <ShieldCheck className="size-5 text-primary" />
              <span className="font-semibold">Privacy promise</span>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Phase 3 delivers the product surface and app shell only. AI execution, chat behavior, and persistence are
              intentionally left for later phases.
            </p>
          </div>
        </div>

        <section className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {principles.map((principle) => {
            const Icon = principle.icon;
            return (
              <Card key={principle.title}>
                <CardHeader>
                  <Icon className="size-5 text-primary" />
                  <CardTitle>{principle.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-6 text-muted-foreground">{principle.copy}</p>
                </CardContent>
              </Card>
            );
          })}
        </section>

        <section id="documentation" className="mt-10 rounded-xl border border-border bg-card p-6 shadow-soft">
          <h2 className="text-heading-3">Documentation</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
            The architecture is organized around the Next.js App Router, reusable layout components, shadcn-style UI
            primitives, local model utilities, and a browser-first persistence layer.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/models"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-soft transition hover:bg-primary/90"
            >
              Explore models
              <ArrowRight className="size-4" />
            </Link>
            <a
              href={siteConfig.githubUrl}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border px-4 text-sm font-medium transition hover:bg-hover"
            >
              <Github className="size-4" />
              GitHub
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
