"use client";

import Link from "next/link";
import type { Route } from "next";
import type { MouseEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
      <aside className={cn("hidden bg-secondary/20 transition-[width] duration-300 lg:flex lg:h-screen lg:flex-col", collapsed ? "lg:w-20" : "lg:w-[260px]")}>
        {content}
      </aside>
      <Button aria-label="Open conversations" variant="ghost" size="icon" className="fixed left-4 top-20 z-30 lg:hidden" onClick={() => onMobileOpenChange(true)}>
        <Menu />
      </Button>
      <AnimatePresence>
        {mobileOpen ? (
          <motion.div className="fixed inset-0 z-50 bg-black/35 backdrop-blur-sm lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.aside className="flex h-full w-[min(22rem,88vw)] flex-col border-r border-border bg-background p-3 shadow-floating-panel" initial={{ x: -32, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -32, opacity: 0 }} transition={{ duration: 0.2 }}>
              <div className="mb-2 flex items-center justify-between">
                <span className="flex items-center gap-2 font-semibold"><Sparkles className="size-5" /> Orion</span>
                <Button aria-label="Close conversations" variant="ghost" size="icon" onClick={() => onMobileOpenChange(false)}>
                  <X />
                </Button>
              </div>
              {content}
            </motion.aside>
          </motion.div>
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
      <div className={cn("flex items-center gap-2 p-3 pb-2", collapsed && "justify-center")}>
        <Button aria-label="New chat" variant="ghost" className={cn("flex-1 justify-between px-2 text-foreground font-medium", collapsed && "size-10 flex-none justify-center px-0")} onClick={onNewChat}>
          <div className="flex items-center gap-2">
            {!collapsed ? <span className="flex items-center gap-2"><Sparkles className="size-4" /> New Chat</span> : <MessageSquarePlus className="size-5" />}
          </div>
          {!collapsed && <MessageSquarePlus className="size-4 text-muted-foreground" />}
        </Button>
        {!collapsed && (
          <Button aria-label="Collapse sidebar" variant="ghost" size="icon" onClick={onToggleCollapsed} className="shrink-0 text-muted-foreground">
            <PanelLeftClose className="size-5" />
          </Button>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3 scrollbar-subtle">
        {!collapsed ? <ConversationSearch value={search} onChange={onSearchChange} /> : null}
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
        <div className={cn("mt-2 flex items-center justify-between rounded-lg p-2 hover:bg-hover cursor-pointer", collapsed && "mt-0 size-10 justify-center p-0")}>
          <div className={cn("flex items-center gap-2", collapsed && "hidden")}>
            <span className="grid size-7 place-items-center rounded-full bg-foreground text-background text-xs"><UserRound className="size-3" /></span>
            <div className="flex flex-col">
              <span className="text-sm font-medium leading-none">Local user</span>
            </div>
          </div>
          <ThemeToggle side="top" />
        </div>
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
    <Link href={href} className={cn("flex h-9 items-center gap-2 rounded-md px-2 text-sm text-muted-foreground transition hover:bg-hover hover:text-foreground", collapsed && "size-9 justify-center px-0")} aria-label={label}>
      <Icon className="size-4" />
      {!collapsed ? label : null}
    </Link>
  );
}
