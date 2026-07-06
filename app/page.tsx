"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, Download, CheckCircle2, Cpu } from "lucide-react";
import { useAI } from "@/hooks/useAI";
import { DEFAULT_MODEL_ID, ORION_MODELS } from "@/lib/constants/models";
import { formatBytes } from "@/services/ai/stream";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const router = useRouter();
  const { installedModels, loadModel, download, runtime } = useAI();
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  const defaultModel = ORION_MODELS.find(m => m.id === DEFAULT_MODEL_ID);
  const isDownloaded = (installedModels || []).some((item) => item.id === DEFAULT_MODEL_ID && (item.status === "downloaded" || item.status === "loaded"));
  const isActiveDownload = download.modelId === DEFAULT_MODEL_ID && download.status === "downloading";

  // Auto redirect if already installed and not currently downloading
  // useEffect(() => {
  //   if (isClient && isDownloaded && !isActiveDownload) {
  //     router.push("/chat");
  //   }
  // }, [isClient, isDownloaded, isActiveDownload, router]);

  if (!isClient) return null;

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background">
      {/* Premium Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(94,106,210,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(67,215,138,0.1),transparent_40%)]" />
        <div className="absolute inset-0 bg-noise opacity-[0.02] mix-blend-overlay pointer-events-none" />
      </div>

      <div className="relative z-10 w-full max-w-2xl px-6 py-12">
        <AnimatePresence mode="wait">
          {!isActiveDownload ? (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-center"
            >
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
                className="mx-auto mb-8 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-b from-primary/20 to-primary/5 shadow-glass border border-primary/20"
              >
                <Sparkles className="size-8 text-primary" />
              </motion.div>
              
              <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
                Welcome to Orion
              </h1>
              <div className="mx-auto mt-6 flex max-w-lg flex-col gap-2 text-lg text-muted-foreground sm:text-xl">
                <p>Private AI.</p>
                <p>Zero Cloud.</p>
                <p>Infinite Possibilities.</p>
              </div>
              <p className="mx-auto mt-8 max-w-md text-sm text-muted-foreground/80">
                Everything happens on your device. Choose your AI model and begin.
              </p>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="mt-16 text-left"
              >
                <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-surface/50 p-6 shadow-floating-panel backdrop-blur-xl transition hover:border-primary/30 hover:bg-surface/80">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  
                  <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-medium text-foreground">{defaultModel?.name || "Llama 3.2 1B"}</h3>
                        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary border border-primary/20">
                          Recommended
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5"><CheckCircle2 className="size-3.5 text-success" /> Works Offline</span>
                        <span className="flex items-center gap-1.5"><Cpu className="size-3.5 text-accent" /> Runs on GPU</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      {!isDownloaded && (
                        <Button
                          size="lg"
                          variant="outline"
                          className="rounded-xl bg-background/50 backdrop-blur-sm hover:bg-background/80"
                          onClick={() => router.push("/chat")}
                        >
                          <span className="flex items-center gap-2 font-medium">
                            Start Chat
                            <ArrowRight className="size-4" />
                          </span>
                        </Button>
                      )}
                      <Button 
                        size="lg" 
                        className="group/btn relative overflow-hidden rounded-xl bg-foreground text-background transition-all hover:bg-foreground/90 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                        onClick={() => isDownloaded ? router.push("/chat") : loadModel(DEFAULT_MODEL_ID)}
                      >
                        <span className="relative z-10 flex items-center gap-2 font-medium">
                          {isDownloaded ? "Start Chat" : "Download Model"}
                          {isDownloaded ? (
                            <ArrowRight className="size-4 transition-transform group-hover/btn:translate-x-0.5" />
                          ) : (
                            <Download className="size-4 transition-transform group-hover/btn:-translate-y-0.5" />
                          )}
                        </span>
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="downloading"
              initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="mx-auto w-full max-w-md rounded-3xl border border-border/50 bg-surface/80 p-8 shadow-floating-panel backdrop-blur-2xl"
            >
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-8 flex size-20 items-center justify-center">
                  <svg className="absolute inset-0 size-full -rotate-90 transform" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="4" className="text-muted/30" />
                    <motion.circle 
                      cx="50" 
                      cy="50" 
                      r="46" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="4" 
                      className="text-primary" 
                      strokeLinecap="round"
                      initial={{ strokeDasharray: "289 289", strokeDashoffset: 289 }}
                      animate={{ strokeDashoffset: 289 - (289 * (download.progress || 0)) }}
                      transition={{ type: "spring", bounce: 0, duration: 0.5 }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-medium text-foreground">{Math.round((download.progress || 0) * 100)}%</span>
                  </div>
                </div>

                <h2 className="text-2xl font-semibold text-foreground">
                  {download.progress === 1 ? "Model Ready" : "Downloading Model"}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {download.message || "Preparing reasoning engine..."}
                </p>

                {download.progress < 1 && (
                  <div className="mt-8 grid w-full grid-cols-2 gap-4 divide-x divide-border/50 border-t border-border/50 pt-6">
                    <div className="flex flex-col items-center">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Speed</span>
                      <span className="mt-1 font-mono text-sm text-foreground">{formatBytes(download.speedBytesPerSecond)}/s</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Downloaded</span>
                      <span className="mt-1 font-mono text-sm text-foreground">{formatBytes(download.downloadedBytes)}</span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
