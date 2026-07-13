"use client";

import Link from "next/link";
import type { Route } from "next";
import type { MouseEvent } from "react";
import { AnimatePresence, m } from "framer-motion";
import { Info, Menu, MessageSquarePlus, PanelLeftClose, PanelLeftOpen, Settings, Sparkles, UserRound, X, Bot } from "lucide-react";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { Button } from "@/components/ui/button";
import { ConversationList } from "@/features/chat/components/conversation-list";
import { ConversationSearch } from "@/features/chat/components/search-bar";
import type { Conversation } from "@/features/chat/types/chat-ui";
import { cn } from "@/lib/utils/cn";

export function ChatSidebar({
  conversations,
  activeId,
  search,
  collapsed,
  mobileOpen,
  onSearchChange,
  onSelectConversation,
  onNewChat,
  onToggleCollapsed,
  onMobileOpenChange,
  onContextMenu
}: {
  conversations: Conversation[];
  activeId: string;
  search: string;
  collapsed: boolean;
  mobileOpen: boolean;
  onSearchChange: (value: string) => void;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onToggleCollapsed: () => void;
  onMobileOpenChange: (open: boolean) => void;
  onContextMenu: (event: MouseEvent<HTMLButtonElement>, conversation: Conversation) => void;
}) {
  const content = (
    <SidebarContent
      conversations={conversations}
      activeId={activeId}
      search={search}
      collapsed={collapsed}
      onSearchChange={onSearchChange}
      onSelectConversation={onSelectConversation}
      onNewChat={onNewChat}
      onToggleCollapsed={onToggleCollapsed}
      onContextMenu={onContextMenu}
    />
  );

  return (
    <>
      <m.aside 
        initial={false}
        animate={{ width: collapsed ? 80 : 260 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="hidden bg-secondary/20 lg:flex lg:h-screen lg:flex-col overflow-hidden border-r border-border/50"
      >
        {content}
      </m.aside>
      <Button aria-label="Open conversations" variant="ghost" size="icon" className="fixed left-4 top-20 z-30 lg:hidden" onClick={() => onMobileOpenChange(true)}>
        <Menu />
      </Button>
      <AnimatePresence>
        {mobileOpen ? (
          <m.div className="fixed inset-0 z-50 bg-black/35 backdrop-blur-sm lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <m.aside className="flex h-full w-[min(22rem,88vw)] flex-col border-r border-border bg-background p-3 shadow-floating-panel" initial={{ x: -32, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -32, opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 30 }}>
              <div className="mb-2 flex items-center justify-between">
                <span className="flex items-center gap-2 font-semibold"><Sparkles className="size-5 text-primary" /> Orion</span>
                <Button aria-label="Close conversations" variant="ghost" size="icon" onClick={() => onMobileOpenChange(false)}>
                  <X />
                </Button>
              </div>
              {content}
            </m.aside>
          </m.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

function SidebarContent({
  conversations,
  activeId,
  search,
  collapsed,
  onSearchChange,
  onSelectConversation,
  onNewChat,
  onToggleCollapsed,
  onContextMenu
}: {
  conversations: Conversation[];
  activeId: string;
  search: string;
  collapsed: boolean;
  onSearchChange: (value: string) => void;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onToggleCollapsed: () => void;
  onContextMenu: (event: MouseEvent<HTMLButtonElement>, conversation: Conversation) => void;
}) {
  return (
    <>
      <div className={cn("flex gap-2 p-3 pb-2", collapsed ? "flex-col items-center" : "items-center")}>
        <m.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
          <Button aria-label="New chat" variant="ghost" className={cn("w-full justify-between px-2 text-foreground font-medium", collapsed && "size-10 flex-none justify-center px-0")} onClick={onNewChat}>
            <div className="flex items-center gap-2">
              {!collapsed ? <span className="flex items-center gap-2"><Sparkles className="size-4 text-primary" /> New Chat</span> : <MessageSquarePlus className="size-5 text-primary" />}
            </div>
            {!collapsed && <MessageSquarePlus className="size-4 text-muted-foreground" />}
          </Button>
        </m.div>
        <m.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Button aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} variant="ghost" size="icon" onClick={onToggleCollapsed} className={cn("shrink-0 text-muted-foreground", collapsed && "size-10")}>
            {collapsed ? <PanelLeftOpen className="size-5" /> : <PanelLeftClose className="size-5" />}
          </Button>
        </m.div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3 scrollbar-subtle">
        <AnimatePresence>
          {!collapsed ? (
            <m.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <ConversationSearch value={search} onChange={onSearchChange} />
            </m.div>
          ) : null}
        </AnimatePresence>
        <div className="mt-4">
          <ConversationList conversations={conversations} activeId={activeId} collapsed={collapsed} onSelect={onSelectConversation} onContextMenu={onContextMenu} />
        </div>
      </div>

      <div className={cn("p-3", collapsed && "grid place-items-center gap-2")}>
        <div className={cn("grid gap-1", collapsed && "place-items-center")}>
          <SidebarLink href="/models" label="Models" collapsed={collapsed} icon={Bot} />
          <SidebarLink href="/settings" label="Settings" collapsed={collapsed} icon={Settings} />
          <SidebarLink href="/about" label="About" collapsed={collapsed} icon={Info} />
        </div>
        <m.div 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={cn("mt-2 flex items-center justify-between rounded-lg p-2 hover:bg-hover cursor-pointer transition-colors", collapsed && "mt-0 size-10 justify-center p-0")}
        >
          <div className={cn("flex items-center gap-2", collapsed && "hidden")}>
            <span className="grid size-7 place-items-center rounded-full bg-foreground text-background text-xs shadow-sm"><UserRound className="size-3" /></span>
            <div className="flex flex-col">
              <span className="text-sm font-medium leading-none">Local user</span>
            </div>
          </div>
          <ThemeToggle side="top" align={collapsed ? "start" : "end"} />
        </m.div>
      </div>
    </>
  );
}

function SidebarLink({
  href,
  label,
  icon: Icon,
  collapsed
}: {
  href: Route;
  label: string;
  icon: typeof Info;
  collapsed: boolean;
}) {
  return (
    <Link href={href} aria-label={label}>
      <m.div 
        whileHover={{ scale: 1.02, backgroundColor: "var(--hover)" }}
        whileTap={{ scale: 0.98 }}
        className={cn("flex h-9 items-center gap-2 rounded-md px-2 text-sm text-muted-foreground transition-colors hover:text-foreground", collapsed && "size-9 justify-center px-0")}
      >
        <Icon className="size-4" />
        <AnimatePresence>
          {!collapsed && (
            <m.span 
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="whitespace-nowrap"
            >
              {label}
            </m.span>
          )}
        </AnimatePresence>
      </m.div>
    </Link>
  );
}
