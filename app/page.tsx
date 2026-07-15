"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, Shield, Zap, FileSearch, Cpu, Download, 
  Database, Fingerprint, Github, FileText, CheckCircle2,
  Lock, Search, Folder, Globe, Laptop, HardDrive, Share2, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GalaxyBackground } from "@/components/layout/galaxy-background";
import { LogoIcon } from "../components/common/logo";
import { useAI } from "@/hooks/useAI";
import { DEFAULT_MODEL_ID } from "@/lib/constants/models";
import { formatBytes } from "@/services/ai/stream";

export default function HomePage() {
  console.log("DEBUG LogoIcon:", LogoIcon);
  const router = useRouter();
  const { installedModels, loadModel, download } = useAI();
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
    console.log("DEBUG: LogoIcon is", LogoIcon);
  }, []);

  const isDownloaded = (installedModels || []).some((item) => item.id === DEFAULT_MODEL_ID && (item.status === "downloaded" || item.status === "loaded"));
  const isActiveDownload = download.modelId === DEFAULT_MODEL_ID && download.status === "downloading";

  if (!isClient) return null;

  return (
    <main className="relative min-h-screen w-full bg-background text-foreground overflow-x-hidden selection:bg-primary/30">
      {/* Premium Colorful Background Effects */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#09090b]" aria-hidden="true">
        {/* Deep space AI background image - Animated */}
        <motion.div 
          animate={{ 
            scale: [1, 1.05, 1],
            x: [0, -20, 0],
            y: [0, -15, 0]
          }}
          transition={{ 
            duration: 40, 
            ease: "linear", 
            repeat: Infinity 
          }}
          className="absolute -inset-[5%] opacity-[0.08] mix-blend-lighten bg-center bg-cover bg-no-repeat" 
          style={{ backgroundImage: 'url("/assets/bg-red-ai.png")' }} 
        />
        {/* Subtle dot grid */}
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        
        {/* Rich aurora orb — top right (Red) */}
        <motion.div
          animate={{ x: [0, 60, 0], y: [0, -40, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 22, ease: "easeInOut", repeat: Infinity }}
          className="absolute -top-[150px] -right-[150px] w-[800px] h-[800px] rounded-full bg-red-600/10 blur-[150px]"
        />
        {/* Rich aurora orb — bottom left (Rose) */}
        <motion.div
          animate={{ x: [0, -50, 0], y: [0, 60, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 28, ease: "easeInOut", repeat: Infinity }}
          className="absolute -bottom-[200px] -left-[150px] w-[700px] h-[700px] rounded-full bg-rose-600/10 blur-[160px]"
        />
        {/* Accent orb — center right (Orange) */}
        <motion.div
          animate={{ x: [0, -40, 0], y: [0, 30, 0] }}
          transition={{ duration: 25, ease: "easeInOut", repeat: Infinity }}
          className="absolute top-[30%] -right-[100px] w-[500px] h-[500px] rounded-full bg-orange-500/10 blur-[140px]"
        />
        {/* Secondary orb — center (Deep Red) */}
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 32, ease: "easeInOut", repeat: Infinity }}
          className="absolute top-1/2 left-[30%] -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-red-500/5 blur-[150px]"
        />
        
        {/* Top vignette for depth */}
        <div className="absolute top-0 inset-x-0 h-[400px] bg-gradient-to-b from-background via-background/80 to-transparent" />
        {/* Bottom vignette */}
        <div className="absolute bottom-0 inset-x-0 h-[300px] bg-gradient-to-t from-background to-transparent" />
      </div>

      {/* Floating Download Overlay */}
      <AnimatePresence>
        {isActiveDownload && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed bottom-8 right-8 z-50 glass-card p-6 w-96 max-w-[calc(100vw-2rem)]"
          >
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <Download className="size-4 text-primary" /> Downloading Model
                </h3>
                <span className="text-xs text-muted-foreground">{Math.round(download.progress || 0)}%</span>
              </div>
              <div className="h-1.5 w-full bg-surface-elevated rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-primary" 
                  initial={{ width: 0 }}
                  animate={{ width: `${download.progress || 0}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatBytes(download.speedBytesPerSecond)}/s</span>
                <span>{formatBytes(download.downloadedBytes)}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        
        {/* 1. Hero Section */}
        <section className="relative flex flex-col items-center justify-center min-h-[90vh] text-center py-20 z-10">
          
          {/* Centered ORION Logo & Text */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="mb-8 flex flex-col items-center gap-3"
          >
            <div className="flex size-16 items-center justify-center rounded-2xl glass-panel shadow-[0_0_30px_rgba(255,140,0,0.15)]">
              <LogoIcon size={42} />
            </div>
            <span className="text-xs font-semibold tracking-[0.5em] text-primary uppercase pl-[0.5em]">ORION</span>
          </motion.div>

          {/* Copy & CTAs */}
          <div className="flex flex-col items-center text-center max-w-3xl">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.8 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/60 drop-shadow-sm leading-[1.1]"
            >
              Your private AI workspace.
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="mt-6 max-w-xl text-lg sm:text-xl text-muted-foreground leading-relaxed mx-auto"
            >
              Chat, analyze, and understand entirely on your device. Zero cloud uploads, 100% private.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="mt-8 flex flex-wrap justify-center gap-3 max-w-2xl"
            >
              <div className="glass-card flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium text-muted-foreground hover:-translate-y-0.5 transition-transform cursor-default">
                <Lock className="size-3.5 text-primary" /> 100% Local AI
              </div>
              <div className="glass-card flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium text-muted-foreground hover:-translate-y-0.5 transition-transform cursor-default">
                <Zap className="size-3.5 text-primary" /> WebGPU Accelerated
              </div>
              <div className="glass-card flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium text-muted-foreground hover:-translate-y-0.5 transition-transform cursor-default">
                <FileSearch className="size-3.5 text-primary" /> Document Intelligence
              </div>
              <div className="glass-card flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium text-muted-foreground hover:-translate-y-0.5 transition-transform cursor-default">
                <Globe className="size-3.5 text-primary" /> Works Offline
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="mt-10 flex flex-col sm:flex-row gap-4 items-center justify-center w-full sm:w-auto"
            >
              <Button 
                size="lg" 
                className="w-full sm:w-auto h-14 px-8 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-base shadow-[0_8px_30px_rgba(255,140,0,0.3)] transition-all hover:-translate-y-1"
                onClick={() => isDownloaded ? router.push("/chat") : loadModel(DEFAULT_MODEL_ID)}
                disabled={isActiveDownload}
              >
                Start Privately
                <ArrowRight className="ml-2 size-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="w-full sm:w-auto h-14 px-8 rounded-full glass-panel hover:bg-white/5 border-border text-base transition-all hover:-translate-y-1"
                onClick={() => window.scrollTo({ top: 800, behavior: 'smooth' })}
              >
                Watch Demo
              </Button>
            </motion.div>
          </div>
        </section>

        {/* 2. Why Orion? */}
        <section className="py-24">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="grid md:grid-cols-3 gap-6"
          >
            <div className="glass-card p-8 flex flex-col items-start gap-4">
              <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                <Lock className="size-8" />
              </div>
              <h3 className="text-xl font-semibold">Privacy First</h3>
              <p className="text-muted-foreground leading-relaxed">
                All AI inference runs locally on your machine. No cloud servers. No tracking. Your data is truly yours.
              </p>
            </div>
            
            <div className="glass-card p-8 flex flex-col items-start gap-4">
              <div className="p-3 rounded-2xl bg-orange-500/10 text-orange-400">
                <Zap className="size-8" />
              </div>
              <h3 className="text-xl font-semibold">On-Device AI</h3>
              <p className="text-muted-foreground leading-relaxed">
                Powered by WebLLM and WebGPU, delivering fast, offline, and private AI capabilities right in your browser.
              </p>
            </div>

            <div className="glass-card p-8 flex flex-col items-start gap-4">
              <div className="p-3 rounded-2xl bg-accent/10 text-accent">
                <FileSearch className="size-8" />
              </div>
              <h3 className="text-xl font-semibold">Intelligent Workspace</h3>
              <p className="text-muted-foreground leading-relaxed">
                Analyze documents, extract text from images, and search your conversations. Everything happens locally.
              </p>
            </div>
          </motion.div>
        </section>

        {/* 3. How Orion Works */}
        <section className="py-24 relative">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">The Private Workflow</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">A seamless, offline experience from start to finish.</p>
          </div>

          <div className="relative flex flex-col gap-8 max-w-3xl mx-auto">
            {/* Timeline Line */}
            <div className="absolute left-8 md:left-1/2 top-4 bottom-4 w-px bg-gradient-to-b from-primary/50 via-secondary/50 to-transparent -translate-x-1/2 hidden md:block" />
            
            {[
              { title: "Download Model", desc: "A one-time download of the AI weights.", icon: Download },
              { title: "Runs Locally", desc: "The model runs directly on your GPU.", icon: Cpu },
              { title: "Upload Documents", desc: "Drag and drop PDFs or images.", icon: Folder },
              { title: "Ask Questions", desc: "Query your documents privately.", icon: Search },
              { title: "Receive Cited Answers", desc: "Get accurate, referenced responses.", icon: CheckCircle2 },
              { title: "Continue Offline", desc: "Disconnect your internet and keep working.", icon: Shield },
            ].map((step, idx) => (
              <motion.div 
                key={step.title}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className={`relative flex items-center gap-8 ${idx % 2 === 0 ? "md:flex-row-reverse" : ""}`}
              >
                <div className="hidden md:block w-1/2" />
                <div className="absolute left-8 md:left-1/2 size-4 rounded-full bg-background border-2 border-primary -translate-x-1/2 shadow-[0_0_15px_rgba(59,130,246,0.5)] z-10 hidden md:block" />
                <div className="glass-card p-6 w-full md:w-1/2 flex items-start gap-4 hover:border-primary/30 group">
                  <div className="p-3 rounded-xl bg-white/5 text-primary group-hover:bg-primary/10 transition-colors">
                    <step.icon className="size-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold mb-1">Step {idx + 1}: {step.title}</h4>
                    <p className="text-sm text-muted-foreground">{step.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* 4. Key Features */}
        <section className="py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Uncompromising Features</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: Shield, title: "Offline AI Chat" },
              { icon: FileText, title: "Document Intelligence" },
              { icon: Search, title: "Optical Character Recognition" },
              { icon: Globe, title: "Global Search" },
              { icon: Database, title: "Model Manager" },
              { icon: Lock, title: "Privacy Dashboard" },
              { icon: HardDrive, title: "Offline Storage" },
              { icon: Zap, title: "Streaming Responses" },
              { icon: Laptop, title: "Installable PWA" }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="glass-panel p-6 flex items-center gap-4 hover:bg-white/5 transition-colors cursor-default"
              >
                <div className="text-muted-foreground"><feature.icon className="size-5" /></div>
                <span className="font-medium text-sm">{feature.title}</span>
              </motion.div>
            ))}
          </div>
        </section>

        {/* 5. Architecture & 6. Comparison */}
        <section className="py-24 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-8">Cloud AI vs Orion</h2>
            <div className="glass-card overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="p-4 font-medium text-muted-foreground">Feature</th>
                    <th className="p-4 font-medium text-muted-foreground">Cloud AI</th>
                    <th className="p-4 font-medium text-primary">Orion</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {[
                    ["Data Privacy", "Leaves device", "Stays on device"],
                    ["Internet", "Required", "Offline capable"],
                    ["Cost", "Monthly sub", "Free (Local GPU)"],
                    ["Latency", "Network bound", "Instant (Local)"],
                    ["Data Usage", "Training data", "Zero tracking"]
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-white/5 transition-colors">
                      <td className="p-4">{row[0]}</td>
                      <td className="p-4 text-muted-foreground">{row[1]}</td>
                      <td className="p-4 font-medium">{row[2]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="glass-panel p-8 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <h3 className="text-xl font-semibold mb-6">Browser Native Architecture</h3>
            <div className="flex flex-col gap-3 relative z-10">
              {['Browser Environment', '↓', 'WebLLM & WebGPU', '↓', 'Web Workers', '↓', 'IndexedDB', '↓', 'User Privacy Preserved'].map((item, i) => (
                <div key={i} className={`text-center font-mono text-sm ${item === '↓' ? 'text-primary/50' : 'bg-white/5 py-2 rounded-lg border border-white/10'}`}>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 8. Tech Stack */}
        <section className="py-24 text-center">
          <h2 className="text-3xl font-bold mb-12">Powered by Modern Web Tech</h2>
          <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
            {['Next.js', 'TypeScript', 'Tailwind', 'WebLLM', 'WebGPU', 'IndexedDB', 'Dexie', 'Framer Motion', 'Tesseract', 'PDF.js', 'React Markdown', 'Zustand'].map((tech) => (
              <span key={tech} className="px-4 py-2 rounded-full glass-panel text-sm text-muted-foreground border border-white/10 hover:text-foreground transition-colors">
                {tech}
              </span>
            ))}
          </div>
        </section>

        {/* 9. Privacy Promise & Demo */}
        <section className="pt-24 pb-8">
          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Privacy Card */}
            <motion.div 
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="glass-card p-10 md:p-14 relative overflow-hidden flex flex-col justify-center"
            >
              <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
              
              <div className="relative z-10 flex flex-col items-start text-left">
                <div className="size-16 rounded-full bg-primary/20 flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(239,68,68,0.3)]">
                  <Shield className="size-8 text-primary" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Your data never leaves your device.</h2>
                <p className="text-lg text-muted-foreground">
                  We believe AI should be an extension of your mind, not a window into it. Orion is built from the ground up for absolute privacy.
                </p>
              </div>
            </motion.div>

            {/* Demo Placeholder */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="glass-card p-2 relative flex flex-col group overflow-hidden"
            >
               <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
               <div className="w-full h-full bg-black/60 rounded-xl border border-white/5 overflow-hidden p-6 md:p-8 flex flex-col justify-center relative min-h-[350px]">
                  
                  {/* Architecture Diagram */}
                  <div className="relative z-10 w-full max-w-xs mx-auto flex flex-col items-center gap-12">
                    
                    {/* Top Node: Browser */}
                    <div className="flex flex-col items-center gap-3">
                      <div className="size-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md shadow-lg relative z-20">
                        <Globe className="size-8 text-foreground" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Your Browser</span>
                    </div>

                    {/* Connection Lines */}
                    <div className="absolute top-[4.5rem] left-1/2 -translate-x-1/2 w-px h-12 bg-gradient-to-b from-white/20 to-primary/50" />
                    <div className="absolute top-[7.5rem] left-1/2 -translate-x-1/2 w-[70%] h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                    <div className="absolute top-[7.5rem] left-[15%] w-px h-12 bg-gradient-to-b from-primary/50 to-primary/20" />
                    <div className="absolute top-[7.5rem] right-[15%] w-px h-12 bg-gradient-to-b from-primary/50 to-primary/20" />

                    {/* Bottom Nodes */}
                    <div className="w-full flex justify-between relative z-20">
                      {/* Node: WebLLM */}
                      <div className="flex flex-col items-center gap-3 w-1/2">
                        <div className="size-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center backdrop-blur-md shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                          <Cpu className="size-7 text-primary" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-primary text-center">WebLLM<br/>GPU</span>
                      </div>

                      {/* Node: IndexedDB */}
                      <div className="flex flex-col items-center gap-3 w-1/2">
                        <div className="size-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center backdrop-blur-md shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                          <Database className="size-7 text-primary" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-primary text-center">Local<br/>Storage</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Subtle Background Elements */}
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(239,68,68,0.05),transparent_70%)] pointer-events-none" />
                  <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
               </div>
            </motion.div>
          </div>
        </section>

        {/* 10. Call to Action */}
        <section className="py-8 pb-16">
          <div className="glass-panel p-12 rounded-[2.5rem] text-center max-w-3xl mx-auto border-white/20 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]">
            <h2 className="text-3xl md:text-5xl font-bold mb-8">Experience the Future of Private AI</h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="h-14 px-8 rounded-full bg-primary hover:bg-primary/90 text-white font-medium text-base shadow-lg hover:scale-105 transition-all"
                onClick={() => isDownloaded ? router.push("/chat") : loadModel(DEFAULT_MODEL_ID)}
              >
                {isDownloaded ? "Start Chatting" : "Launch Orion"}
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="h-14 px-8 rounded-full glass-card hover:bg-white/10 text-base transition-all flex items-center gap-2"
                onClick={() => window.open('https://github.com/santheesh73/Orion', '_blank')}
              >
                <Github className="size-5" /> View on GitHub
              </Button>
            </div>
          </div>
        </section>
        
        {/* Footer */}
        <footer className="mt-20 border-t border-border/40 py-12 text-center text-xs text-muted-foreground">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 font-semibold text-foreground text-sm uppercase tracking-wider">
              <LogoIcon size={18} />
              <span>Orion</span>
            </div>
            <p className="max-w-md leading-relaxed text-muted-foreground/70">
              Private, browser-native AI workspace. Runs entirely on your device with WebGPU acceleration.
            </p>
            <div className="flex gap-6 mt-2 text-muted-foreground/75">
              <a href="https://github.com/santheesh73/Orion" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">GitHub</a>
              <span className="opacity-20">•</span>
              <a href="https://github.com/santheesh73/Orion/blob/main/LICENSE" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">License</a>
              <span className="opacity-20">•</span>
              <a href="https://github.com/santheesh73/Orion/blob/main/README.md" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Documentation</a>
            </div>
            <div className="mt-6 text-[10px] text-muted-foreground/50">
              &copy; {new Date().getFullYear()} Orion. Open source under the MIT License. Created by Santheesh.
            </div>
          </div>
        </footer>
        
      </div>
    </main>
  );
}
