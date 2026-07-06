"use client";

import { motion, type HTMLMotionProps, type Variants } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.22, ease: "easeOut" } }
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.2, ease: "easeOut" } }
};

export const slideUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.28, ease: "easeOut" } }
};

export const blurIn: Variants = {
  hidden: { opacity: 0, filter: "blur(10px)" },
  visible: { opacity: 1, filter: "blur(0px)", transition: { duration: 0.28, ease: "easeOut" } }
};

export const pageTransition: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.32, ease: "easeOut" } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.18, ease: "easeIn" } }
};

export const modalTransition: Variants = scaleIn;

export const drawerTransition = {
  right: { hidden: { x: 28, opacity: 0 }, visible: { x: 0, opacity: 1 } },
  left: { hidden: { x: -28, opacity: 0 }, visible: { x: 0, opacity: 1 } },
  top: { hidden: { y: -28, opacity: 0 }, visible: { y: 0, opacity: 1 } },
  bottom: { hidden: { y: 28, opacity: 0 }, visible: { y: 0, opacity: 1 } }
} satisfies Record<string, Variants>;

export const toastTransition: Variants = {
  hidden: { opacity: 0, y: -10, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.18 } }
};

export const hoverMotion = { scale: 1.01, transition: { duration: 0.16 } };
export const pressMotion = { scale: 0.985, transition: { duration: 0.08 } };

export function MotionFade({ children, className, ...props }: HTMLMotionProps<"div"> & { children: ReactNode }) {
  return (
    <motion.div initial="hidden" animate="visible" variants={fadeIn} className={cn(className)} {...props}>
      {children}
    </motion.div>
  );
}

export function MotionPage({ children, className, ...props }: HTMLMotionProps<"main"> & { children: ReactNode }) {
  return (
    <motion.main initial="hidden" animate="visible" exit="exit" variants={pageTransition} className={cn(className)} {...props}>
      {children}
    </motion.main>
  );
}

export function TypingDots({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1", className)} aria-label="Typing">
      {[0, 1, 2].map((index) => (
        <motion.span
          key={index}
          className="size-1.5 rounded-full bg-muted-foreground"
          animate={{ opacity: [0.35, 1, 0.35], y: [0, -2, 0] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: index * 0.12 }}
        />
      ))}
    </span>
  );
}
