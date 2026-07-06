"use client";

import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";

export function SearchBar({
  value,
  onChange,
  placeholder = "Search",
  className
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="pl-9 pr-10" type="search" />
      {value ? (
        <Button aria-label="Clear search" variant="ghost" size="icon" className="absolute right-0 top-0" onClick={() => onChange("")}>
          <X />
        </Button>
      ) : null}
    </div>
  );
}
