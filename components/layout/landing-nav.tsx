"use client";

import Link from "next/link";
import { AnimatePresence, m } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/common/logo";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { Button } from "@/components/ui/button";
import { marketingNav, siteConfig } from "@/lib/constants/site";

export function LandingNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/76 backdrop-blur-2xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Landing navigation">
          {marketingNav.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm text-muted-foreground transition hover:bg-hover hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
          <a
            href={siteConfig.githubUrl}
            className="rounded-md px-3 py-2 text-sm text-muted-foreground transition hover:bg-hover hover:text-foreground"
          >
            GitHub
          </a>
        </nav>
        <div className="hidden items-center gap-2 lg:flex">
          <ThemeToggle />
          <Link
            href="/chat"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-soft transition hover:bg-primary/90 active:scale-[0.99]"
          >
            Get Started
          </Link>
        </div>
        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          <Button aria-label="Open navigation" variant="ghost" size="icon" onClick={() => setOpen(true)}>
            <Menu />
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {open ? (
          <m.div
            className="fixed inset-0 z-50 bg-background/96 p-4 backdrop-blur-xl lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex items-center justify-between">
              <Logo />
              <Button aria-label="Close navigation" variant="ghost" size="icon" onClick={() => setOpen(false)}>
                <X />
              </Button>
            </div>
            <nav className="mt-8 grid gap-2" aria-label="Mobile landing navigation">
              {marketingNav.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-4 py-3 text-lg font-medium transition hover:bg-hover"
                >
                  {item.label}
                </Link>
              ))}
              <a
                href={siteConfig.githubUrl}
                onClick={() => setOpen(false)}
                className="rounded-lg px-4 py-3 text-lg font-medium transition hover:bg-hover"
              >
                GitHub
              </a>
              <Link
                href="/chat"
                onClick={() => setOpen(false)}
                className="mt-4 inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-soft transition hover:bg-primary/90"
              >
                Launch Orion
              </Link>
            </nav>
          </m.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
