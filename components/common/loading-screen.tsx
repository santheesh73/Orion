"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence, useMotionTemplate, useMotionValue } from "framer-motion";
import { Check, Cpu, Globe, Lock, Shield } from "lucide-react";
import { LogoIcon } from "@/components/common/logo";
import { useOrionStore } from "@/store/orion-store";
import { cn } from "@/lib/utils/cn";

const LOADING_MESSAGES = [
  "Initializing workspace...",
  "Preparing environment...",
  "Loading AI engine...",
  "Optimizing performance...",
  "Almost ready..."
];

export function LoadingScreen({ label }: { label?: string }) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const download = useOrionStore((state) => state.download);
  const modelProgress = useOrionStore((state) => state.modelProgress);
  
  // Compute progress for the circular indicator
  const progressPercent = download.progress || modelProgress.progress || 0;
  
  useEffect(() => {
    if (progressPercent >= 100 && modelProgress.status === "ready") {
      setIsReady(true);
    }
  }, [progressPercent, modelProgress.status]);

  useEffect(() => {
    if (isReady) return;
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [isReady]);

  // Ambient parallax
  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    setMousePos({ 
      x: (clientX / window.innerWidth - 0.5) * 20, 
      y: (clientY / window.innerHeight - 0.5) * 20 
    });
  };

  const currentMessage = label && !isReady ? label : LOADING_MESSAGES[messageIndex];

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      animate={isReady ? { opacity: 0, scale: 1.05 } : { opacity: 1, scale: 1 }}
      transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
      onMouseMove={handleMouseMove}
      className="fixed inset-0 z-[100] grid place-items-center bg-black overflow-hidden selection:bg-white/10 pointer-events-auto"
    >
      {/* Ambient Background & Radial Lighting */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <motion.div 
          animate={{ x: mousePos.x * -2, y: mousePos.y * -2 }}
          transition={{ type: "spring", stiffness: 50, damping: 20 }}
          className="absolute inset-0"
        >
          {/* Deep cinematic gradient overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-background to-background" />
          
          {/* Subtle animated aurora flares */}
          <motion.div
            animate={{ scale: [1, 1.05, 1], opacity: [0.2, 0.3, 0.2] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[120px]"
          />
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-indigo-500/10 blur-[140px]"
          />
          
          {/* Soft animated grain */}
          <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />
          
          {/* Light vignette */}
          <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(0,0,0,0.9)]" />
        </motion.div>
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-xl w-full px-6">
        {/* Floating Glass Logo Container */}
        <motion.div
          animate={{ y: [0, -8, 0], rotate: [-1, 1, -1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="relative mb-12"
        >
          {/* Glow Pulse Behind Logo */}
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-[32px] bg-blue-500/20 blur-xl"
          />
          
          <div className="relative flex size-32 items-center justify-center rounded-[32px] border border-white/[0.08] bg-white/[0.02] shadow-[0_8px_32px_rgba(0,0,0,0.4),_inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-2xl transition-transform hover:scale-105 active:scale-95 duration-500 cursor-default">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
              <LogoIcon size={64} className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
            </motion.div>
          </div>
        </motion.div>

        {/* Intelligent Rotating Messages */}
        <div className="h-8 mb-12 relative w-full flex justify-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={currentMessage}
              initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="absolute text-lg font-medium tracking-wide text-white/90 text-center"
            >
              {currentMessage}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Premium Circular Progress Indicator */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="relative flex flex-col items-center p-8 w-full max-w-sm rounded-[32px] border border-white/[0.05] bg-white/[0.01] shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-xl mb-12"
        >
          <div className="relative size-32 mb-6 flex items-center justify-center">
            {/* Background Track */}
            <svg className="absolute inset-0 size-full -rotate-90 text-white/5" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="2" />
            </svg>
            {/* Animated Fill */}
            <svg className="absolute inset-0 size-full -rotate-90 text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]" viewBox="0 0 100 100">
              <motion.circle 
                cx="50" cy="50" r="46" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round"
                strokeDasharray="289"
                initial={{ strokeDashoffset: 289 }}
                animate={{ strokeDashoffset: 289 - (289 * progressPercent) / 100 }}
                transition={{ type: "spring", bounce: 0, duration: 0.8 }}
              />
            </svg>
            <span className="text-3xl font-light tracking-tighter text-white">
              {Math.round(progressPercent)}<span className="text-lg text-white/40">%</span>
            </span>
          </div>

          <div className="w-full flex justify-between text-xs font-medium text-white/50 tracking-wider uppercase">
            <span className="flex flex-col gap-1 items-start">
              <span>Downloaded</span>
              <span className="text-white/80 font-mono tracking-normal text-sm">{(download.downloadedBytes / 1024 / 1024).toFixed(1)} MB</span>
            </span>
            <span className="flex flex-col gap-1 items-end">
              <span>Remaining</span>
              <span className="text-white/80 font-mono tracking-normal text-sm">{Math.max(0, (download.sizeBytes - download.downloadedBytes) / 1024 / 1024).toFixed(1)} MB</span>
            </span>
          </div>
        </motion.div>

        {/* Status Indicators */}
        <div className="flex flex-wrap justify-center gap-3">
          {[
            { id: 'local', label: 'Local Runtime', icon: Cpu },
            { id: 'gpu', label: 'GPU Ready', icon: Shield },
            { id: 'offline', label: 'Offline Support', icon: Globe },
            { id: 'secure', label: 'Secure Session', icon: Lock }
          ].map((chip, idx) => {
            const isChipReady = progressPercent > (idx * 25);
            return (
              <motion.div
                key={chip.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + idx * 0.1, type: "spring" }}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-medium tracking-wide transition-colors duration-500",
                  isChipReady 
                    ? "border-blue-500/30 bg-blue-500/10 text-blue-100 shadow-[0_0_15px_rgba(59,130,246,0.15)]" 
                    : "border-white/5 bg-white/5 text-white/40"
                )}
              >
                <chip.icon className="size-3.5" />
                {chip.label}
                {isChipReady && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
                    <Check className="size-3 text-blue-400 ml-1" />
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
