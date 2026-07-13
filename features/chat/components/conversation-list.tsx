"use client";

import type { MouseEvent } from "react";
import { m, AnimatePresence } from "framer-motion";
import { ConversationItem } from "@/features/chat/components/conversation-item";
import type { Conversation } from "@/features/chat/types/chat-ui";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

export function ConversationList({
  conversations,
  activeId,
  collapsed,
  onSelect,
  onContextMenu
}: {
  conversations: Conversation[];
  activeId: string;
  collapsed: boolean;
  onSelect: (id: string) => void;
  onContextMenu: (event: MouseEvent<HTMLButtonElement>, conversation: Conversation) => void;
}) {
  if (conversations.length === 0) {
    if (collapsed) return null;
    return (
      <m.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        className="rounded-lg border border-dashed border-border p-4 text-center text-caption text-muted-foreground"
      >
        No conversations found.
      </m.div>
    );
  }

  const pinned = conversations.filter((c) => c.pinned);
  const favorites = conversations.filter((c) => c.favorite && !c.pinned);
  const others = conversations.filter((c) => !c.pinned && !c.favorite);

  return (
    <m.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid gap-5"
    >
      <AnimatePresence mode="popLayout">
        {!collapsed && pinned.length > 0 ? (
          <m.section layout key="pinned-section">
            <h2 className="mb-2 px-2 text-[0.7rem] font-semibold text-muted-foreground uppercase tracking-wider">Pinned</h2>
            <div className="grid gap-0.5">
              <AnimatePresence mode="popLayout">
                {pinned.map((conversation) => (
                  <ConversationItem key={`pinned-${conversation.id}`} conversation={conversation} active={activeId === conversation.id} collapsed={collapsed} onSelect={() => onSelect(conversation.id)} onContextMenu={onContextMenu} />
                ))}
              </AnimatePresence>
            </div>
          </m.section>
        ) : null}

        {!collapsed && favorites.length > 0 ? (
          <m.section layout key="favorites-section">
            <h2 className="mb-2 px-2 text-[0.7rem] font-semibold text-muted-foreground uppercase tracking-wider">Favorites</h2>
            <div className="grid gap-0.5">
              <AnimatePresence mode="popLayout">
                {favorites.map((conversation) => (
                  <ConversationItem key={`favorite-${conversation.id}`} conversation={conversation} active={activeId === conversation.id} collapsed={collapsed} onSelect={() => onSelect(conversation.id)} onContextMenu={onContextMenu} />
                ))}
              </AnimatePresence>
            </div>
          </m.section>
        ) : null}

        {others.length > 0 && (
          <m.section layout key="others-section">
            {!collapsed ? <h2 className="mb-2 px-2 text-[0.7rem] font-semibold text-muted-foreground uppercase tracking-wider">Chats</h2> : null}
            <div className="grid gap-0.5">
              <AnimatePresence mode="popLayout">
                {others.map((conversation) => (
                  <ConversationItem key={conversation.id} conversation={conversation} active={activeId === conversation.id} collapsed={collapsed} onSelect={() => onSelect(conversation.id)} onContextMenu={onContextMenu} />
                ))}
              </AnimatePresence>
            </div>
          </m.section>
        )}
      </AnimatePresence>
    </m.div>
  );
}
