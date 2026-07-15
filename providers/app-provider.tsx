"use client";

import { Toaster } from "sonner";
import { ThemeProvider } from "@/providers/theme-provider";

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      {children}
      <Toaster 
        position="top-center" 
        toastOptions={{
          style: {
            background: 'var(--card)',
            color: 'var(--foreground)',
            border: '1px solid var(--border)',
            backdropFilter: 'blur(12px)',
            boxShadow: 'var(--shadow-floating-panel)',
            borderRadius: '1rem',
          },
          className: 'glass',
        }}
      />
    </ThemeProvider>
  );
}
