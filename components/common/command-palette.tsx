"use client";

import { useEffect } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

export function CommandPalette({
  open,
  onOpenChange,
  items,
  search,
  onSearchChange,
  shouldFilter = true
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: Array<{ label: string; action: () => void }>;
  search?: string;
  onSearchChange?: (value: string) => void;
  shouldFilter?: boolean;
}) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        onOpenChange(!open);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onOpenChange, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Command palette" className="overflow-hidden border border-border/50 bg-background/80 p-0 shadow-glass backdrop-blur-2xl">
      <Command className="bg-transparent" shouldFilter={shouldFilter}>
        <div className="border-b border-border/50 px-3 pb-1 pt-3">
          <CommandInput placeholder="Type a command or search..." className="text-base" value={search} onValueChange={onSearchChange} />
        </div>
        <CommandList className="max-h-[350px] overflow-y-auto p-2 scrollbar-subtle">
          <CommandEmpty className="px-3 py-10 text-center text-sm text-muted-foreground">
            No results found. Try another search.
          </CommandEmpty>
          {items.map((item) => (
            <CommandItem 
              key={item.label} 
              onSelect={item.action}
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition-colors aria-selected:bg-primary/10 aria-selected:text-primary"
            >
              {item.label}
            </CommandItem>
          ))}
        </CommandList>
      </Command>
    </Dialog>
  );
}
