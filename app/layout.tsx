import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppShell } from "@/components/layout/app-shell";
import { AppProvider } from "@/providers/app-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"]
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"]
});

export const metadata: Metadata = {
  title: "Orion - Private On-Device AI",
  description: "The Private AI That Lives On Your Device",
  metadataBase: new URL("https://orion.local"),
  manifest: "/manifest.json",
  applicationName: "Orion",
  keywords: ["on-device AI", "WebLLM", "offline AI", "private AI", "WebGPU"],
  appleWebApp: {
    capable: true,
    title: "Orion",
    statusBarStyle: "black-translucent"
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icons/icon.svg", type: "image/svg+xml" }
    ],
    apple: "/icons/icon.svg"
  },
  openGraph: {
    title: "Orion - Private On-Device AI",
    description: "Private AI. Zero Cloud. Infinite Possibilities.",
    url: "https://orion.local",
    siteName: "Orion",
    type: "website",
    images: [{ url: "/assets/social-preview.svg", width: 1200, height: 630, alt: "Orion private AI assistant" }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Orion - Private On-Device AI",
    description: "A premium offline-first AI assistant that runs entirely on-device using WebLLM.",
    images: ["/assets/social-preview.svg"]
  }
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafaf8" },
    { media: "(prefers-color-scheme: dark)", color: "#0e1015" }
  ],
  colorScheme: "light dark",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AppProvider>
          <AppShell>{children}</AppShell>
        </AppProvider>
      </body>
    </html>
  );
}
