"use client";

import { motion } from "framer-motion";
import { Download, RefreshCw, Wifi, WifiOff, X } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNetwork } from "@/hooks/useNetwork";
import { useOffline } from "@/hooks/useOffline";
import { usePWA } from "@/hooks/usePWA";
import { cn } from "@/lib/utils/cn";

export function PWAStatus() {
  const network = useNetwork();
  const offline = useOffline();
  const pwa = usePWA();
  const [dismissed, setDismissed] = useState(false);

  const showInstall = !dismissed && !pwa.snapshot.installed && (pwa.snapshot.installable || pwa.snapshot.platform === "ios");
  const online = network?.online ?? true;

  return (
    <div className="flex items-center gap-2">
      <Badge variant={online ? "success" : "warning"} className="hidden gap-1.5 sm:inline-flex">
        {online ? <Wifi className="size-3" /> : <WifiOff className="size-3" />}
        {online ? (network?.quality === "slow" ? "Slow network" : "Online") : "Offline"}
      </Badge>
      <Badge variant={offline.snapshot?.ready ? "primary" : "default"} className="hidden sm:inline-flex">
        {offline.snapshot?.ready ? "Offline ready" : "Caching"}
      </Badge>
      {pwa.snapshot.updateAvailable ? (
        <Button type="button" variant="outline" size="sm" onClick={() => void pwa.activateUpdate()}>
          <RefreshCw />
          Update
        </Button>
      ) : null}
      {showInstall ? (
        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-1 rounded-md border border-border bg-card p-1 shadow-soft">
          <Button
            type="button"
            size="sm"
            variant={pwa.snapshot.installable ? "primary" : "outline"}
            onClick={() => {
              if (pwa.snapshot.platform === "ios" && !pwa.snapshot.installable) return;
              void pwa.install();
            }}
            aria-label="Install Orion"
          >
            <Download />
            <span className={cn(pwa.snapshot.platform === "ios" && "hidden sm:inline")}>{pwa.snapshot.platform === "ios" && !pwa.snapshot.installable ? "Share > Add" : "Install"}</span>
          </Button>
          <Button type="button" variant="ghost" size="icon" onClick={() => setDismissed(true)} aria-label="Dismiss install banner">
            <X />
          </Button>
        </motion.div>
      ) : null}
    </div>
  );
}
