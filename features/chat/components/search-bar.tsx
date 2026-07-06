"use client";

import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ConversationSearch({
  value,
  onChange
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search conversations"
        className="h-10 rounded-lg bg-background/70 pl-9 pr-9"
        aria-label="Search conversations"
      />
      {value ? (
        <Button aria-label="Clear conversation search" variant="ghost" size="icon" className="absolute right-0 top-0 size-10" onClick={() => onChange("")}>
          <X className="size-4" />
        </Button>
      ) : null}
    </div>
  );
}
