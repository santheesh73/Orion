"use client";

import { Laptop, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Tooltip } from "@/components/ui/tooltip";
import { useMounted } from "@/hooks/use-mounted";

export function ThemeToggle({ side = "bottom" }: { side?: "top" | "bottom" }) {
  const { setTheme, resolvedTheme } = useTheme();
  const mounted = useMounted();
  const Icon = mounted && resolvedTheme === "dark" ? Moon : Sun;

  return (
    <DropdownMenu
      side={side}
      trigger={
        <Tooltip content="Theme" side={side === "top" ? "top" : "bottom"}>
          <Button aria-label="Change theme" variant="ghost" size="icon">
            <Icon />
          </Button>
        </Tooltip>
      }
    >
      <DropdownMenuItem onClick={() => setTheme("light")}>
        <Sun className="size-4" />
        Light
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => setTheme("dark")}>
        <Moon className="size-4" />
        Dark
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => setTheme("system")}>
        <Laptop className="size-4" />
        System
      </DropdownMenuItem>
    </DropdownMenu>
  );
}
