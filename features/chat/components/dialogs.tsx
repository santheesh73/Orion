"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import type { Conversation } from "@/features/chat/types/chat-ui";

export function RenameConversationDialog({
  open,
  conversation,
  onOpenChange,
  onRename
}: {
  open: boolean;
  conversation: Conversation | undefined;
  onOpenChange: (open: boolean) => void;
  onRename: (title: string) => void;
}) {
  const [title, setTitle] = useState(conversation?.title ?? "");

  useEffect(() => {
    setTitle(conversation?.title ?? "");
  }, [conversation]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Rename conversation" description="Update the visible name for this local UI conversation.">
      <form
        className="grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          onRename(title);
        }}
      >
        <Input value={title} onChange={(event) => setTitle(event.target.value)} aria-label="Conversation name" />
        <Button type="submit" disabled={!title.trim()}>Rename</Button>
      </form>
    </Dialog>
  );
}

export function DeleteConversationDialog({
  open,
  conversation,
  onOpenChange,
  onDelete
}: {
  open: boolean;
  conversation: Conversation | undefined;
  onOpenChange: (open: boolean) => void;
  onDelete: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Delete conversation">
      <div className="grid gap-4 py-2">
        <p className="text-sm text-muted-foreground leading-relaxed">
          Are you sure you want to delete <span className="font-semibold text-foreground">"{conversation?.title ?? "this conversation"}"</span>? 
          This will permanently delete all <span className="font-semibold text-foreground">{conversation?.messageCount ?? 0} messages</span> and cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="destructive" onClick={onDelete}>Delete</Button>
        </div>
      </div>
    </Dialog>
  );
}

export function ExportChatDialog({
  open,
  conversation,
  onOpenChange,
  onExport
}: {
  open: boolean;
  conversation: Conversation | undefined;
  onOpenChange: (open: boolean) => void;
  onExport: (format: "markdown" | "json" | "txt" | "pdf") => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Export chat" description="Choose a local export format for this conversation.">
      <div className="grid gap-2">
        {["Markdown", "JSON", "TXT", "PDF"].map((format) => (
          <Button
            key={format}
            variant="outline"
            onClick={() => {
              onExport(format.toLowerCase() as "markdown" | "json" | "txt" | "pdf");
              onOpenChange(false);
            }}
          >
            Export {conversation?.title ?? "conversation"} as {format}
          </Button>
        ))}
      </div>
    </Dialog>
  );
}

export function NewFolderDialog({
  open,
  onOpenChange
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="New folder" description="Create a local folder label for organizing conversations.">
      <div className="grid gap-4">
        <Input placeholder="Research notes" aria-label="Folder name" />
        <Button onClick={() => onOpenChange(false)}>Create folder</Button>
      </div>
    </Dialog>
  );
}

export function ConversationInfoDialog({
  open,
  conversation,
  onOpenChange
}: {
  open: boolean;
  conversation: Conversation | undefined;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Conversation information">
      <div className="grid gap-3 text-sm">
        <InfoRow label="Title" value={conversation?.title ?? "New conversation"} />
        <InfoRow label="Messages" value={`${conversation?.messageCount ?? 0}`} />
        <InfoRow label="Updated" value={conversation?.updatedAt ?? "Now"} />
        <InfoRow label="Runtime" value="Local WebLLM worker" />
      </div>
    </Dialog>
  );
}

export function SettingsShortcutDialog({
  open,
  onOpenChange
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Chat settings shortcut" description="Fast UI controls for the chat surface.">
      <div className="grid gap-4 text-sm">
        <label className="flex items-center justify-between gap-4">
          Compact messages
          <Switch />
        </label>
        <label className="flex items-center justify-between gap-4">
          Show timestamps
          <Switch defaultChecked />
        </label>
        <label className="flex items-center justify-between gap-4">
          Reduce animation
          <Switch />
        </label>
      </div>
    </Dialog>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg bg-secondary px-3 py-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
