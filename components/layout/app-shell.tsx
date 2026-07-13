"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";
import { m, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Activity, Brain, Command, FileText, Info, MessageSquare, Settings, Sparkles, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { CommandPalette } from "@/components/common/command-palette";
import { Logo } from "@/components/common/logo";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { PWAStatus } from "@/components/pwa/pwa-status";
import { Button } from "@/components/ui/button";
import { useOrionStore } from "@/store/orion-store";
import { cn } from "@/lib/utils/cn";

const navItems: Array<{ href: Route; label: string; icon: typeof Sparkles }> = [
  { href: "/", label: "Home", icon: Sparkles },
  { href: "/chat", label: "Chat", icon: MessageSquare },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/models", label: "Models", icon: Brain },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/performance", label: "Performance", icon: Activity },
  { href: "/about", label: "About", icon: Info }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [commandOpen, setCommandOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const appSettings = useOrionStore((state) => state.appSettings);
  const adminMode = appSettings?.adminMode ?? false;

  useEffect(() => {
    // Auto collapse sidebar on pages with secondary sidebars/panels
    if (["/chat", "/settings", "/documents", "/models"].includes(pathname)) {
      setSidebarOpen(false);
    }
  }, [pathname]);

  const visibleNavItems = navItems.filter((item) => {
    if (adminMode) return true;
    return !["/performance"].includes(item.href);
  });

  if (pathname === "/") {
    return <div className="min-h-screen bg-background text-foreground">{children}</div>;
  }

  const chatRoute = pathname === "/chat";

  const commandItems = visibleNavItems.map((item) => ({
    label: `Open ${item.label}`,
    action: () => {
      setCommandOpen(false);
      router.push(item.href);
    }
  }));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_5%,rgba(48,119,238,0.18),transparent_28%),radial-gradient(circle_at_82%_14%,rgba(46,186,119,0.14),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.8),transparent_42%)] dark:bg-[radial-gradient(circle_at_20%_5%,rgba(55,118,255,0.16),transparent_28%),radial-gradient(circle_at_82%_14%,rgba(58,205,124,0.12),transparent_24%)]" />
      
      <m.aside 
        initial={false}
        animate={{ width: sidebarOpen ? 288 : 64 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed inset-y-0 left-0 z-20 hidden border-r border-border bg-background/82 py-5 backdrop-blur-xl lg:flex lg:flex-col overflow-hidden"
      >
        <div className={cn("flex h-10 items-center whitespace-nowrap", sidebarOpen ? "justify-between px-6" : "justify-center px-2")}>
          <AnimatePresence mode="popLayout">
            {sidebarOpen && (
              <m.div
                key="logo"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                whileHover={{ scale: 1.05 }}
              >
                <Logo />
              </m.div>
            )}
          </AnimatePresence>
          <m.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-muted-foreground hover:text-foreground shrink-0" 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <PanelLeftClose className="size-5" /> : <PanelLeftOpen className="size-5" />}
            </Button>
          </m.div>
        </div>

        <nav className="mt-8 flex-1 space-y-1.5 px-3">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex h-10 items-center rounded-lg text-sm transition-colors",
                  sidebarOpen ? "gap-3 px-3 w-full" : "justify-center w-10 mx-auto",
                  active ? "text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                )}
                title={!sidebarOpen ? item.label : undefined}
              >
                {active && (
                  <m.div
                    layoutId="activeNav"
                    className="absolute inset-0 rounded-lg bg-secondary shadow-sm"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <Icon className={cn("relative z-10 shrink-0", sidebarOpen ? "size-4" : "size-5", active && "text-primary")} />
                <AnimatePresence>
                  {sidebarOpen && (
                    <m.span 
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      className="relative z-10 whitespace-nowrap font-medium"
                    >
                      {item.label}
                    </m.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </nav>

        <AnimatePresence>
          {sidebarOpen && (
            <m.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mt-auto mx-4 rounded-xl border border-border/50 bg-surface/50 p-4 shadow-sm backdrop-blur-md"
            >
              <div className="flex items-center gap-2 text-sm font-medium">
                <Command className="size-4 text-primary" />
                Offline promise
              </div>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                Orion stores chats, documents, and model state locally. AI inference runs in the browser worker.
              </p>
            </m.div>
          )}
        </AnimatePresence>
      </m.aside>

      <m.header 
        initial={false}
        animate={{ marginLeft: sidebarOpen ? 288 : 64 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="sticky top-0 z-10 border-b border-border bg-background/82 backdrop-blur-xl lg:hidden"
      >
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2 lg:hidden">
            <Sparkles className="size-5 text-primary" />
            <span className="font-semibold">Orion</span>
          </div>
          
          <div className="flex items-center gap-2">
            <PWAStatus />
            {!chatRoute ? (
              <m.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button aria-label="Open command palette" variant="ghost" size="icon" onClick={() => setCommandOpen(true)}>
                  <Command />
                </Button>
              </m.div>
            ) : null}
            <ThemeToggle />
          </div>
        </div>
      </m.header>

      <m.main
        key={pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0, marginLeft: sidebarOpen ? 288 : 64 }}
        transition={{ 
          opacity: { duration: 0.2 },
          y: { duration: 0.2 },
          marginLeft: { type: "spring", stiffness: 300, damping: 30 }
        }}
      >
        {children}
      </m.main>

      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-7 border-t border-border bg-background/92 backdrop-blur-xl lg:hidden">
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn("grid h-14 place-items-center text-muted-foreground transition-colors", active && "text-primary")}
              aria-label={item.label}
            >
              <m.div whileTap={{ scale: 0.9 }}>
                <Icon className="size-5" />
              </m.div>
            </Link>
          );
        })}
      </nav>
      {!chatRoute ? <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} items={commandItems} /> : null}
    </div>
  );
}

