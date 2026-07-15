"use client";

import dynamic from "next/dynamic";

const ChatLayoutDynamic = dynamic(
  () => import("./chat-layout"),
  { 
    ssr: false, 
    loading: () => <div className="flex h-screen items-center justify-center bg-background text-muted-foreground">Loading Orion...</div> 
  }
);

export default ChatLayoutDynamic;
