"use client";

import type { MouseEvent } from "react";
import { ConversationItem } from "@/features/chat/components/conversation-item";
import type { Conversation } from "@/features/chat/types/chat-ui";

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
    return <div className="rounded-lg border border-dashed border-border p-4 text-center text-caption text-muted-foreground">No conversations found.</div>;
  }

  const pinned = conversations.filter((c) => c.pinned);
  const favorites = conversations.filter((c) => c.favorite && !c.pinned);
  const others = conversations.filter((c) => !c.pinned && !c.favorite);

  return (
    <div className="grid gap-5">
      {!collapsed && pinned.length > 0 ? (
        <section>
          <h2 className="mb-2 px-2 text-[0.7rem] font-semibold text-muted-foreground">Pinned</h2>
          <div className="grid gap-0.5">
            {pinned.map((conversation) => (
              <ConversationItem key={`pinned-${conversation.id}`} conversation={conversation} active={activeId === conversation.id} collapsed={collapsed} onSelect={() => onSelect(conversation.id)} onContextMenu={onContextMenu} />
            ))}
          </div>
        </section>
      ) : null}

      {!collapsed && favorites.length > 0 ? (
        <section>
          <h2 className="mb-2 px-2 text-[0.7rem] font-semibold text-muted-foreground">Favorites</h2>
          <div className="grid gap-0.5">
            {favorites.map((conversation) => (
              <ConversationItem key={`favorite-${conversation.id}`} conversation={conversation} active={activeId === conversation.id} collapsed={collapsed} onSelect={() => onSelect(conversation.id)} onContextMenu={onContextMenu} />
            ))}
          </div>
        </section>
      ) : null}

      {others.length > 0 && (
        <section>
          {!collapsed ? <h2 className="mb-2 px-2 text-[0.7rem] font-semibold text-muted-foreground">Chats</h2> : null}
          <div className="grid gap-0.5">
            {others.map((conversation) => (
              <ConversationItem key={conversation.id} conversation={conversation} active={activeId === conversation.id} collapsed={collapsed} onSelect={() => onSelect(conversation.id)} onContextMenu={onContextMenu} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
