"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Activity, Brain, Command, FileText, Info, MessageSquare, Settings, Sparkles, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { CommandPalette } from "@/components/common/command-palette";
import { Logo } from "@/components/common/logo";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { PWAStatus } from "@/components/pwa/pwa-status";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
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
  const setAppSettings = useOrionStore((state) => state.setAppSettings);
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
      
      <aside className={cn(
        "fixed inset-y-0 left-0 z-20 hidden border-r border-border bg-background/82 py-5 backdrop-blur-xl transition-[width] duration-300 ease-in-out lg:flex lg:flex-col",
        sidebarOpen ? "w-72 px-4" : "w-16 items-center px-2"
      )}>
        <div className={cn("flex h-10 items-center", sidebarOpen ? "justify-between px-2" : "justify-center")}>
          {sidebarOpen && <Logo />}
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-muted-foreground hover:text-foreground shrink-0" 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <PanelLeftClose className="size-5" /> : <PanelLeftOpen className="size-5" />}
          </Button>
        </div>

        <nav className="mt-8 space-y-2 flex-1">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex h-10 items-center rounded-md text-sm text-muted-foreground transition hover:bg-secondary hover:text-foreground",
                  sidebarOpen ? "gap-3 px-3 w-full" : "justify-center w-10 mx-auto",
                  active && "bg-secondary text-foreground"
                )}
                title={!sidebarOpen ? item.label : undefined}
              >
                <Icon className={cn("shrink-0", sidebarOpen ? "size-4" : "size-5")} />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {sidebarOpen && (
          <div className="mt-auto rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Command className="size-4" />
              Offline promise
            </div>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              Orion stores chats, documents, and model state locally. AI inference runs in the browser worker.
            </p>
          </div>
        )}
      </aside>

      <header className={cn(
        "sticky top-0 z-10 border-b border-border bg-background/82 backdrop-blur-xl transition-[margin] duration-300 ease-in-out lg:hidden",
        sidebarOpen ? "ml-72" : "ml-16"
      )}>
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2 lg:hidden">
            <Sparkles className="size-5" />
            <span className="font-semibold">Orion</span>
          </div>
          
          <div className="flex items-center gap-2">
            <PWAStatus />
            {!chatRoute ? (
              <Button aria-label="Open command palette" variant="ghost" size="icon" onClick={() => setCommandOpen(true)}>
                <Command />
              </Button>
            ) : null}
            <ThemeToggle />
          </div>
        </div>
      </header>

      <motion.main
        key={pathname}
        className={cn("transition-[margin] duration-300 ease-in-out", sidebarOpen ? "lg:ml-72" : "lg:ml-16")}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
      >
        {children}
      </motion.main>

      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-7 border-t border-border bg-background/92 backdrop-blur-xl lg:hidden">
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn("grid h-14 place-items-center text-muted-foreground", active && "text-foreground")}
              aria-label={item.label}
            >
              <Icon className="size-5" />
            </Link>
          );
        })}
      </nav>
      {!chatRoute ? <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} items={commandItems} /> : null}
    </div>
  );
}
