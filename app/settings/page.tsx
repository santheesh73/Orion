"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent, type ComponentType } from "react";
import { m } from "framer-motion";
import { useTheme as useNextTheme } from "next-themes";
import {
  Accessibility,
  AppWindow,
  Bot,
  Brush,
  ChevronRight,
  Database,
  Download,
  FileText,
  Gauge,
  Globe,
  HardDrive,
  Import,
  Info,
  Keyboard,
  Laptop,
  Lock,
  MonitorCog,
  Palette,
  RefreshCw,
  RotateCcw,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Trash2,
} from "lucide-react";
import { ModelCard } from "@/components/models/model-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useModels } from "@/hooks/useModels";
import { useBrowser } from "@/hooks/useBrowser";
import { useCache } from "@/hooks/useCache";
import { useOffline } from "@/hooks/useOffline";
import { usePWA } from "@/hooks/usePWA";
import { usePrivacy } from "@/hooks/usePrivacy";
import { useSettings } from "@/hooks/useSettings";
import { useStorage } from "@/hooks/useStorage";
import { ORION_MODELS } from "@/lib/constants/models";
import { cn } from "@/lib/utils/cn";
import { settingsCenterService } from "@/services/settings/settings.service";
import { formatBytes } from "@/services/ai/stream";
import type { AppSettings } from "@/types/orion";

type SectionId =
  | "general"
  | "appearance"
  | "ai"
  | "models"
  | "storage"
  | "documents"
  | "keyboard"
  | "accessibility"
  | "privacy"
  | "pwa"
  | "personalization"
  | "about";

const sections: Array<{ id: SectionId; label: string; description: string; icon: ComponentType<{ className?: string }> }> = [
  { id: "general", label: "General", description: "Language, startup, autosave, reset", icon: Settings },
  { id: "appearance", label: "Appearance", description: "Theme, color, density, motion", icon: Palette },
  { id: "ai", label: "AI", description: "Generation, prompts, memory", icon: Bot },
  { id: "models", label: "Models", description: "Download, switch, inspect", icon: MonitorCog },
  { id: "storage", label: "Storage", description: "Usage, cleanup, import, export", icon: HardDrive },
  { id: "documents", label: "Documents", description: "Chunking, preview, indexing", icon: FileText },
  { id: "keyboard", label: "Keyboard", description: "Shortcuts and send behavior", icon: Keyboard },
  { id: "accessibility", label: "Accessibility", description: "Contrast, focus, screen readers", icon: Accessibility },
  { id: "privacy", label: "Privacy", description: "Local-only status and permissions", icon: ShieldCheck },
  { id: "pwa", label: "PWA", description: "Install, offline cache, updates", icon: AppWindow },
  { id: "personalization", label: "Personalization", description: "Tone and custom instructions", icon: Sparkles },
  { id: "about", label: "About", description: "Version, stack, license", icon: Info }
];

const shortcutLabels: Record<string, string> = {
  commandPalette: "Command palette",
  newChat: "New chat",
  search: "Search",
  settings: "Settings",
  exportData: "Export",
  importData: "Import",
  toggleSidebar: "Toggle sidebar",
  toggleTheme: "Theme",
  generate: "Generate",
  stop: "Stop"
};

function downloadText(name: string, content: string, type = "application/json") {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function SettingsPage() {
  const [active, setActive] = useState<SectionId>("general");
  const importRef = useRef<HTMLInputElement>(null);
  const { settings, update, reset, loading } = useSettings();
  const nextTheme = useNextTheme();

  useEffect(() => {
    nextTheme.setTheme(settings.theme);
  }, [nextTheme, settings.theme]);

  async function updateTheme(theme: AppSettings["theme"]) {
    nextTheme.setTheme(theme);
    await update({ theme });
  }

  async function exportSettings() {
    downloadText("orion-settings.json", await settingsCenterService.exportSettings());
  }

  async function exportEverything() {
    downloadText("orion-export.json", await settingsCenterService.exportEverything());
  }

  async function importSettings(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const imported = await settingsCenterService.importSettings(await file.text());
    await update(imported);
    event.target.value = "";
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 pb-20 pt-5 sm:px-6 lg:pb-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-heading-2">Settings Center</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Configure Orion&apos;s local model, privacy boundary, storage, documents, appearance, and preferences.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={exportSettings}>
              <Download />
              Settings
            </Button>
            <Button type="button" variant="outline" onClick={exportEverything}>
              <Database />
              Export all
            </Button>
            <Button type="button" variant="secondary" onClick={() => importRef.current?.click()}>
              <Import />
              Import
            </Button>
            <input ref={importRef} type="file" accept="application/json,.json" className="sr-only" onChange={(event) => void importSettings(event)} />
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-20 lg:self-start">
            <div className="hidden rounded-lg border border-border bg-card p-2 shadow-soft lg:block">
              {sections.map((section) => (
                <NavButton key={section.id} section={section} active={active === section.id} onClick={() => setActive(section.id)} />
              ))}
            </div>
            <div className="flex gap-2 overflow-x-auto rounded-lg border border-border bg-card p-2 shadow-soft scrollbar-subtle lg:hidden">
              {sections.map((section) => (
                <Button key={section.id} type="button" variant={active === section.id ? "primary" : "ghost"} size="sm" onClick={() => setActive(section.id)}>
                  <section.icon />
                  {section.label}
                </Button>
              ))}
            </div>
          </aside>

          <m.main
            key={active}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: settings.accessibility.reduceMotion ? 0 : 0.18 }}
            className="min-w-0"
          >
            {loading ? <Panel title="Loading" icon={RefreshCw}><p className="text-sm text-muted-foreground">Loading local preferences...</p></Panel> : null}
            {!loading && active === "general" ? <GeneralPanel settings={settings} update={update} reset={reset} /> : null}
            {!loading && active === "appearance" ? <AppearancePanel settings={settings} update={update} updateTheme={updateTheme} /> : null}
            {!loading && active === "ai" ? <AiPanel settings={settings} update={update} /> : null}
            {!loading && active === "models" ? <ModelsPanel settings={settings} update={update} /> : null}
            {!loading && active === "storage" ? <StoragePanel exportEverything={exportEverything} /> : null}
            {!loading && active === "documents" ? <DocumentsPanel settings={settings} update={update} /> : null}
            {!loading && active === "keyboard" ? <KeyboardPanel settings={settings} update={update} /> : null}
            {!loading && active === "accessibility" ? <AccessibilityPanel settings={settings} update={update} /> : null}
            {!loading && active === "privacy" ? <PrivacyPanel /> : null}
            {!loading && active === "pwa" ? <PWAPanel /> : null}
            {!loading && active === "personalization" ? <PersonalizationPanel settings={settings} update={update} /> : null}
            {!loading && active === "about" ? <AboutPanel /> : null}
          </m.main>
        </div>
      </div>
    </div>
  );
}

function NavButton({
  section,
  active,
  onClick
}: {
  section: (typeof sections)[number];
  active: boolean;
  onClick: () => void;
}) {
  const Icon = section.icon;
  return (
    <button
      type="button"
      className={cn("mb-1 flex w-full items-center gap-3 rounded-md p-3 text-left transition", active ? "bg-primary text-primary-foreground" : "hover:bg-hover")}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") onClick();
      }}
    >
      <Icon className="size-4 shrink-0" />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium">{section.label}</span>
        <span className={cn("mt-0.5 block truncate text-xs", active ? "text-primary-foreground/75" : "text-muted-foreground")}>{section.description}</span>
      </span>
      <ChevronRight className="size-4 opacity-60" />
    </button>
  );
}

function Panel({ title, icon: Icon, children }: { title: string; icon: ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-border bg-card shadow-soft">
      <div className="flex items-center gap-3 border-b border-border p-4">
        <div className="grid size-10 place-items-center rounded-md bg-primary/10 text-primary">
          <Icon className="size-5" />
        </div>
        <h2 className="text-heading-4">{title}</h2>
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="grid gap-2 text-sm">
      <span className="font-medium">{label}</span>
      {children}
      {hint ? <span className="text-xs leading-5 text-muted-foreground">{hint}</span> : null}
    </label>
  );
}

function SelectField<T extends string>({
  value,
  onChange,
  options,
  label
}: {
  value: T;
  onChange: (value: T) => void;
  options: Array<{ value: T; label: string }>;
  label: string;
}) {
  return (
    <Field label={label}>
      <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={value} onChange={(event) => onChange(event.target.value as T)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

function ToggleRow({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md border border-border bg-background p-3">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onChange={(event) => onChange(event.target.checked)} aria-label={label} />
    </div>
  );
}

function GeneralPanel({ settings, update, reset }: { settings: AppSettings; update: (settings: Partial<AppSettings>) => Promise<AppSettings>; reset: () => Promise<void> }) {
  return (
    <Panel title="General" icon={Settings}>
      <div className="grid gap-4 md:grid-cols-2">
        <SelectField value={settings.language} label="Language" onChange={(language) => void update({ language })} options={[{ value: "en", label: "English" }]} />
        <SelectField value={settings.startupBehavior} label="Startup behavior" onChange={(startupBehavior) => void update({ startupBehavior })} options={[
          { value: "last-session", label: "Restore last session" },
          { value: "new-chat", label: "New chat" },
          { value: "documents", label: "Documents" },
          { value: "models", label: "Models" }
        ]} />
        <SelectField value={settings.defaultLandingPage} label="Default landing page" onChange={(defaultLandingPage) => void update({ defaultLandingPage })} options={[
          { value: "home", label: "Home" },
          { value: "chat", label: "Chat" },
          { value: "documents", label: "Documents" },
          { value: "models", label: "Models" },
          { value: "settings", label: "Settings" }
        ]} />
        <SelectField value={settings.dateFormat} label="Date format" onChange={(dateFormat) => void update({ dateFormat })} options={[
          { value: "system", label: "System" },
          { value: "iso", label: "ISO" },
          { value: "short", label: "Short" },
          { value: "long", label: "Long" }
        ]} />
        <SelectField value={settings.timeFormat} label="Time format" onChange={(timeFormat) => void update({ timeFormat })} options={[
          { value: "system", label: "System" },
          { value: "12h", label: "12 hour" },
          { value: "24h", label: "24 hour" }
        ]} />
        <ToggleRow label="Auto save" description="Persist chats, documents, and preferences as they change." checked={settings.autoSave} onChange={(autoSave) => void update({ autoSave })} />
      </div>
      <div className="mt-4 rounded-md border border-error/30 bg-error/5 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium">Application reset</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">Restore preferences to Orion defaults. Local documents and conversations are not deleted here.</p>
          </div>
          <Button type="button" variant="destructive" onClick={() => void reset()}>
            <RotateCcw />
            Reset settings
          </Button>
        </div>
      </div>
    </Panel>
  );
}

function AppearancePanel({ settings, update, updateTheme }: { settings: AppSettings; update: (settings: Partial<AppSettings>) => Promise<AppSettings>; updateTheme: (theme: AppSettings["theme"]) => Promise<void> }) {
  return (
    <Panel title="Appearance" icon={Brush}>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <p className="text-sm font-medium">Theme</p>
          <div className="flex flex-wrap gap-2">
            {(["light", "dark", "system"] as const).map((theme) => (
              <Button key={theme} type="button" variant={settings.theme === theme ? "primary" : "outline"} onClick={() => void updateTheme(theme)}>
                {theme === "system" ? <Laptop /> : theme === "dark" ? <MonitorCog /> : <AppWindow />}
                {theme}
              </Button>
            ))}
          </div>
        </div>
        <SelectField value={settings.appearance.accentColor} label="Accent color" onChange={(accentColor) => void update({ appearance: { ...settings.appearance, accentColor } })} options={[
          { value: "blue", label: "Blue" },
          { value: "green", label: "Green" },
          { value: "violet", label: "Violet" },
          { value: "rose", label: "Rose" },
          { value: "amber", label: "Amber" }
        ]} />
        <SelectField value={settings.fontSize} label="Font size" onChange={(fontSize) => void update({ fontSize })} options={[
          { value: "sm", label: "Small" },
          { value: "md", label: "Medium" },
          { value: "lg", label: "Large" }
        ]} />
        <SelectField value={settings.appearance.chatDensity} label="Chat density" onChange={(chatDensity) => void update({ appearance: { ...settings.appearance, chatDensity } })} options={[
          { value: "comfortable", label: "Comfortable" },
          { value: "cozy", label: "Cozy" },
          { value: "compact", label: "Compact" }
        ]} />
        <SelectField value={settings.appearance.roundedCorners} label="Rounded corners" onChange={(roundedCorners) => void update({ appearance: { ...settings.appearance, roundedCorners } })} options={[
          { value: "sm", label: "Subtle" },
          { value: "md", label: "Balanced" },
          { value: "lg", label: "Soft" }
        ]} />
        <SelectField value={settings.appearance.animationSpeed} label="Animation speed" onChange={(animationSpeed) => void update({ appearance: { ...settings.appearance, animationSpeed } })} options={[
          { value: "reduced", label: "Reduced" },
          { value: "normal", label: "Normal" },
          { value: "fast", label: "Fast" }
        ]} />
        <Field label={`Transparency ${settings.appearance.transparency}%`}>
          <Slider min={0} max={100} value={settings.appearance.transparency} onChange={(event) => void update({ appearance: { ...settings.appearance, transparency: Number(event.target.value) } })} />
        </Field>
        <Field label={`Sidebar width ${settings.appearance.sidebarWidth}px`}>
          <Slider min={220} max={420} step={10} value={settings.appearance.sidebarWidth} onChange={(event) => void update({ appearance: { ...settings.appearance, sidebarWidth: Number(event.target.value) } })} />
        </Field>
        <ToggleRow label="Compact mode" description="Tighten spacing across dense screens." checked={settings.appearance.compactMode} onChange={(compactMode) => void update({ appearance: { ...settings.appearance, compactMode } })} />
        <ToggleRow label="Glass effects" description="Use translucent panels where the design system supports them." checked={settings.appearance.glassEffects} onChange={(glassEffects) => void update({ appearance: { ...settings.appearance, glassEffects } })} />
      </div>
    </Panel>
  );
}

function AiPanel({ settings, update }: { settings: AppSettings; update: (settings: Partial<AppSettings>) => Promise<AppSettings> }) {
  return (
    <Panel title="AI Settings" icon={SlidersHorizontal}>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label={`Temperature ${settings.temperature.toFixed(1)}`}>
          <Slider min={0} max={1.5} step={0.1} value={settings.temperature} onChange={(event) => void update({ temperature: Number(event.target.value) })} />
        </Field>
        <Field label={`Top P ${settings.topP.toFixed(2)}`}>
          <Slider min={0.1} max={1} step={0.05} value={settings.topP} onChange={(event) => void update({ topP: Number(event.target.value) })} />
        </Field>
        <Field label={`Top K ${settings.topK}`}>
          <Slider min={1} max={100} step={1} value={settings.topK} onChange={(event) => void update({ topK: Number(event.target.value) })} />
        </Field>
        <Field label="Maximum tokens">
          <Input type="number" min={128} max={8192} value={settings.maxTokens} onChange={(event) => void update({ maxTokens: Number(event.target.value) })} />
        </Field>
        <Field label="Context length">
          <Input type="number" min={512} max={32768} value={settings.ai.contextLength} onChange={(event) => void update({ ai: { ...settings.ai, contextLength: Number(event.target.value) } })} />
        </Field>
        <SelectField value={settings.ai.responseLength} label="Response length" onChange={(responseLength) => void update({ ai: { ...settings.ai, responseLength } })} options={[
          { value: "concise", label: "Concise" },
          { value: "balanced", label: "Balanced" },
          { value: "detailed", label: "Detailed" }
        ]} />
        <SelectField value={settings.ai.creativityPreset} label="Creativity preset" onChange={(creativityPreset) => void update({ ai: { ...settings.ai, creativityPreset } })} options={[
          { value: "precise", label: "Precise" },
          { value: "balanced", label: "Balanced" },
          { value: "creative", label: "Creative" }
        ]} />
        <ToggleRow label="Streaming" description="Show tokens as the local model generates them." checked={settings.ai.streaming} onChange={(streaming) => void update({ ai: { ...settings.ai, streaming } })} />
        <ToggleRow label="Auto load last model" description="Restore the last loaded local model when Orion starts." checked={settings.ai.autoLoadLastModel} onChange={(autoLoadLastModel) => void update({ ai: { ...settings.ai, autoLoadLastModel } })} />
        <ToggleRow label="Conversation memory" description="Include recent chat history when assembling prompts." checked={settings.ai.conversationMemory} onChange={(conversationMemory) => void update({ ai: { ...settings.ai, conversationMemory } })} />
      </div>
      <Field label="Default system prompt" hint="This prompt is sent locally to WebLLM with each chat.">
        <Textarea className="min-h-36" value={settings.systemPrompt} onChange={(event) => void update({ systemPrompt: event.target.value })} />
      </Field>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {settings.ai.promptTemplates.map((template) => (
          <div key={template.id} className="rounded-md border border-border bg-background p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium">{template.name}</p>
              <Badge variant={template.favorite ? "primary" : "default"}>{template.category}</Badge>
            </div>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">{template.prompt}</p>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function ModelsPanel({ settings, update }: { settings: AppSettings; update: (settings: Partial<AppSettings>) => Promise<AppSettings> }) {
  const models = useModels();
  const selectedModel = ORION_MODELS.find((item) => item.id === settings.preferredModel) ?? ORION_MODELS[0];

  return (
    <Panel title="Model Manager" icon={MonitorCog}>
      <div className="mb-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex gap-2">
          <Input value={models.query} onChange={(event) => models.setQuery(event.target.value)} placeholder="Search models" aria-label="Search models" />
          <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={models.family} onChange={(event) => models.setFamily(event.target.value)}>
            {models.families.map((family) => (
              <option key={family} value={family}>{family === "all" ? "All families" : family}</option>
            ))}
          </select>
          <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={models.sort} onChange={(event) => models.setSort(event.target.value as "name" | "size" | "context")}>
            <option value="name">Name</option>
            <option value="size">Size</option>
            <option value="context">Context</option>
          </select>
        </div>
        <div className="rounded-md border border-border bg-background p-3 text-sm">
          <p className="font-medium">{selectedModel.name}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge>{models.runtime.backend.toUpperCase()}</Badge>
          <Badge>{models.runtime.loadedModelId ? "Loaded" : "Not loaded"}</Badge>
            <Badge>{selectedModel.contextWindow.toLocaleString()} ctx</Badge>
          </div>
        </div>
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        <Button variant="outline" onClick={models.resetWorker}>
          <RefreshCw className="size-4" />
          Reset worker
        </Button>
        <Button variant="outline" onClick={() => models.installedModels.forEach((model) => models.deleteModel(model.id))} disabled={models.installedModels.length === 0}>
          <Trash2 className="size-4" />
          Clear downloaded models
        </Button>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {models.models.map((model) => (
          <ModelCard
            key={model.id}
            model={model}
            selected={settings.preferredModel === model.id}
            active={models.download.modelId === model.id}
            installed={models.installedModels.some((item) => item.id === model.id && (item.status === "downloaded" || item.status === "loaded"))}
            loaded={models.runtime.loadedModelId === model.id}
            progress={models.download}
            onSelect={() => {
              models.setSelectedModelId(model.id);
              void update({ preferredModel: model.id });
            }}
            onLoad={() => models.loadModel(model.id)}
            onUnload={models.unloadModel}
            onReload={models.reloadModel}
            onPause={models.pauseDownload}
            onCancel={models.cancelDownload}
            onResume={models.resumeDownload}
            onRetry={models.retryDownload}
            onDelete={() => models.deleteModel(model.id)}
            onVerify={() => void models.verifyModel(model.id)}
          />
        ))}
      </div>
    </Panel>
  );
}

function StoragePanel({ exportEverything }: { exportEverything: () => Promise<void> }) {
  const storage = useStorage();
  const usagePercent = storage.storage.quota > 0 ? Math.min(100, (storage.storage.totalUsage / storage.storage.quota) * 100) : 0;
  const rows = [
    ["Database", storage.storage.databaseSize],
    ["Conversations", storage.storage.conversationSize],
    ["Documents", storage.storage.documentSize],
    ["Models metadata", storage.storage.modelSize],
    ["Cache estimate", storage.storage.cacheSize],
    ["Free space", storage.storage.free]
  ];

  return (
    <Panel title="Storage Manager" icon={HardDrive}>
      <div className="rounded-md border border-border bg-background p-4">
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="font-medium">Browser storage</span>
          <span className="text-muted-foreground">{formatBytes(storage.storage.totalUsage)} / {formatBytes(storage.storage.quota)}</span>
        </div>
        <Progress className="mt-3" value={usagePercent} />
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {rows.map(([label, value]) => (
          <div key={label} className="rounded-md border border-border bg-background p-3">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-2 text-sm font-medium">{formatBytes(Number(value))}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={() => void storage.refresh()}><RefreshCw />Refresh</Button>
        <Button type="button" variant="outline" onClick={() => void storage.clearCache()}><Trash2 />Clear cache</Button>
        <Button type="button" variant="outline" onClick={() => void storage.optimizeDatabase()}><Gauge />Optimize DB</Button>
        <Button type="button" variant="outline" onClick={exportEverything}><Download />Export database</Button>
        <Button type="button" variant="destructive" onClick={() => void storage.clearConversations()}><Trash2 />Delete conversations</Button>
        <Button type="button" variant="destructive" onClick={() => void storage.clearDocuments()}><Trash2 />Delete documents</Button>
        <Button type="button" variant="destructive" onClick={() => void storage.clearModelMetadata()}><Trash2 />Delete model records</Button>
      </div>
    </Panel>
  );
}

function DocumentsPanel({ settings, update }: { settings: AppSettings; update: (settings: Partial<AppSettings>) => Promise<AppSettings> }) {
  return (
    <Panel title="Document Settings" icon={FileText}>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Default folder">
          <Input value={settings.documents.defaultFolderId ?? ""} onChange={(event) => void update({ documents: { ...settings.documents, defaultFolderId: event.target.value || null } })} placeholder="Folder id or blank" />
        </Field>
        <Field label="Chunk size">
          <Input type="number" min={512} max={8000} value={settings.documents.chunkSize} onChange={(event) => void update({ documents: { ...settings.documents, chunkSize: Number(event.target.value) } })} />
        </Field>
        <SelectField value={settings.documents.previewTheme} label="Preview theme" onChange={(previewTheme) => void update({ documents: { ...settings.documents, previewTheme } })} options={[
          { value: "system", label: "System" },
          { value: "light", label: "Light" },
          { value: "dark", label: "Dark" }
        ]} />
        <Field label="Maximum file size MB">
          <Input type="number" min={1} max={512} value={settings.documents.maxFileSizeMb} onChange={(event) => void update({ documents: { ...settings.documents, maxFileSizeMb: Number(event.target.value) } })} />
        </Field>
        <SelectField value={settings.documents.searchMode} label="Search preference" onChange={(searchMode) => void update({ documents: { ...settings.documents, searchMode } })} options={[
          { value: "keyword", label: "Keyword" },
          { value: "semantic", label: "Semantic" },
          { value: "hybrid", label: "Hybrid" }
        ]} />
        <ToggleRow label="Auto index" description="Parse, chunk, and index after upload." checked={settings.documents.autoIndex} onChange={(autoIndex) => void update({ documents: { ...settings.documents, autoIndex } })} />
        <ToggleRow label="Document cache" description="Keep parsed text and chunks in IndexedDB." checked={settings.documents.documentCache} onChange={(documentCache) => void update({ documents: { ...settings.documents, documentCache } })} />
      </div>
      <div className="mt-4 rounded-md border border-border bg-background p-3">
        <p className="text-sm font-medium">Supported formats</p>
        <p className="mt-2 text-xs leading-6 text-muted-foreground">PDF, DOCX, TXT, Markdown, CSV, JSON, HTML, JavaScript, TypeScript, Python, Java, C, C++, C#, Go, Rust, Kotlin, Swift, YAML, XML, SQL, and logs.</p>
      </div>
    </Panel>
  );
}

function KeyboardPanel({ settings, update }: { settings: AppSettings; update: (settings: Partial<AppSettings>) => Promise<AppSettings> }) {
  const entries = useMemo(() => Object.entries(shortcutLabels), []);
  return (
    <Panel title="Keyboard Shortcuts" icon={Keyboard}>
      <div className="grid gap-3 md:grid-cols-2">
        {entries.map(([key, label]) => (
          <Field key={key} label={label}>
            <Input value={settings.shortcuts[key] ?? ""} onChange={(event) => void update({ shortcuts: { ...settings.shortcuts, [key]: event.target.value } })} />
          </Field>
        ))}
        <SelectField value={settings.keyboard.sendShortcut} label="Send message" onChange={(sendShortcut) => void update({ keyboard: { ...settings.keyboard, sendShortcut } })} options={[
          { value: "mod-enter", label: "Ctrl/Cmd + Enter" },
          { value: "enter", label: "Enter" }
        ]} />
        <ToggleRow label="Escape stops generation" description="Use Escape to stop local generation when a response is streaming." checked={settings.keyboard.escapeStopsGeneration} onChange={(escapeStopsGeneration) => void update({ keyboard: { ...settings.keyboard, escapeStopsGeneration } })} />
      </div>
    </Panel>
  );
}

function AccessibilityPanel({ settings, update }: { settings: AppSettings; update: (settings: Partial<AppSettings>) => Promise<AppSettings> }) {
  return (
    <Panel title="Accessibility" icon={Accessibility}>
      <div className="grid gap-4 md:grid-cols-2">
        <ToggleRow label="High contrast" description="Increase visible separation between foreground, borders, and surfaces." checked={settings.accessibility.highContrast} onChange={(highContrast) => void update({ accessibility: { ...settings.accessibility, highContrast } })} />
        <ToggleRow label="Reduced motion" description="Minimize transitions and animated movement." checked={settings.accessibility.reduceMotion} onChange={(reduceMotion) => void update({ accessibility: { ...settings.accessibility, reduceMotion } })} />
        <ToggleRow label="Keyboard navigation" description="Keep navigation fully reachable from the keyboard." checked={settings.accessibility.keyboardNavigation} onChange={(keyboardNavigation) => void update({ accessibility: { ...settings.accessibility, keyboardNavigation } })} />
        <ToggleRow label="Screen reader mode" description="Prefer explicit labels and announcements for generated content." checked={settings.accessibility.screenReaderMode} onChange={(screenReaderMode) => void update({ accessibility: { ...settings.accessibility, screenReaderMode } })} />
        <ToggleRow label="Focus indicators" description="Show strong focus rings on interactive controls." checked={settings.accessibility.focusIndicators} onChange={(focusIndicators) => void update({ accessibility: { ...settings.accessibility, focusIndicators } })} />
        <ToggleRow label="Announce streaming" description="Expose streaming response changes to assistive technology." checked={settings.accessibility.announceStreaming} onChange={(announceStreaming) => void update({ accessibility: { ...settings.accessibility, announceStreaming } })} />
        <Field label={`Font scaling ${settings.accessibility.fontScaling}%`}>
          <Slider min={85} max={140} value={settings.accessibility.fontScaling} onChange={(event) => void update({ accessibility: { ...settings.accessibility, fontScaling: Number(event.target.value) } })} />
        </Field>
        <Field label={`Line height ${settings.accessibility.lineHeight.toFixed(1)}`}>
          <Slider min={1.2} max={2} step={0.1} value={settings.accessibility.lineHeight} onChange={(event) => void update({ accessibility: { ...settings.accessibility, lineHeight: Number(event.target.value) } })} />
        </Field>
      </div>
    </Panel>
  );
}

function PrivacyPanel() {
  const { snapshot, refresh } = usePrivacy();
  return (
    <Panel title="Privacy Dashboard" icon={Lock}>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <StatusCard icon={ShieldCheck} label="Cloud processing" value="None configured" ok />
        <StatusCard icon={Globe} label="Network status" value={snapshot?.offline ? "Offline" : "Online browser"} ok={snapshot?.offline ?? false} />
        <StatusCard icon={MonitorCog} label="Backend" value={snapshot?.backend ?? "Checking"} ok />
        <StatusCard icon={Database} label="Storage location" value={snapshot?.storageLocation ?? "IndexedDB"} ok />
        <StatusCard icon={HardDrive} label="Model location" value={snapshot?.modelLocation ?? "Browser cache"} ok />
        <StatusCard icon={Gauge} label="Worker status" value={snapshot?.workerStatus ?? "Unknown"} ok />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-md border border-border bg-background p-4">
          <p className="text-sm font-medium">Browser capabilities</p>
          <div className="mt-3 grid gap-2">
            {snapshot?.capabilities.map((capability) => (
              <div key={capability.name} className="flex items-center justify-between text-sm">
                <span>{capability.name}</span>
                <Badge variant={capability.supported ? "success" : "warning"}>{capability.supported ? "Supported" : "Unavailable"}</Badge>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-md border border-border bg-background p-4">
          <p className="text-sm font-medium">Permissions</p>
          <div className="mt-3 grid gap-2">
            {snapshot?.permissions.map((permission) => (
              <div key={permission.name} className="flex items-center justify-between text-sm">
                <span>{permission.name}</span>
                <Badge>{permission.state}</Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Button className="mt-4" type="button" variant="outline" onClick={() => void refresh()}>
        <RefreshCw />
        Refresh privacy status
      </Button>
    </Panel>
  );
}

function PWAPanel() {
  const pwa = usePWA();
  const cache = useCache();
  const offline = useOffline();
  const browser = useBrowser();

  return (
    <Panel title="Progressive Web App" icon={AppWindow}>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <StatusCard icon={AppWindow} label="Install status" value={pwa.snapshot.installed ? "Installed" : pwa.snapshot.installable ? "Ready to install" : "Browser controlled"} ok={pwa.snapshot.installed || pwa.snapshot.installable} />
        <StatusCard icon={RefreshCw} label="Service worker" value={pwa.snapshot.serviceWorker} ok={pwa.snapshot.serviceWorker === "active" || pwa.snapshot.serviceWorker === "ready"} />
        <StatusCard icon={HardDrive} label="Offline cache" value={offline.snapshot?.ready ? "Prepared" : "Pending"} ok={Boolean(offline.snapshot?.ready)} />
        <StatusCard icon={Database} label="Cache entries" value={`${cache.snapshot?.entries.length ?? 0} caches`} ok={Boolean(cache.snapshot?.entries.length)} />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-md border border-border bg-background p-4">
          <p className="text-sm font-medium">Installation</p>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            Desktop and Android browsers show the native install prompt when available. On iOS, use Share then Add to Home Screen.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button type="button" variant="primary" disabled={!pwa.snapshot.installable} onClick={() => void pwa.install()}>
              <Download />
              Install Orion
            </Button>
            <Button type="button" variant="outline" onClick={() => void pwa.checkForUpdates()}>
              <RefreshCw />
              Check for updates
            </Button>
            <Button type="button" variant="destructive" onClick={() => void pwa.resetPWA()}>
              <RotateCcw />
              Reset PWA
            </Button>
          </div>
        </div>
        <div className="rounded-md border border-border bg-background p-4">
          <p className="text-sm font-medium">Offline controls</p>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            Cache app routes for startup, request persistent browser storage, and clear runtime caches without touching IndexedDB documents or chats.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={() => void offline.prepareOfflineMode()}>
              <Database />
              Prepare offline
            </Button>
            <Button type="button" variant="outline" onClick={() => void browser.requestPersistentStorage()}>
              <ShieldCheck />
              Persist storage
            </Button>
            <Button type="button" variant="outline" onClick={() => void cache.clearRuntimeCaches()}>
              <Trash2 />
              Clear runtime cache
            </Button>
          </div>
        </div>
      </div>
    </Panel>
  );
}

function StatusCard({ icon: Icon, label, value, ok }: { icon: ComponentType<{ className?: string }>; label: string; value: string; ok: boolean }) {
  return (
    <div className="rounded-md border border-border bg-background p-4 transition-colors hover:border-primary/50">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Icon className="size-4" />
        {label}
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        <p className="break-words text-sm text-muted-foreground">{value}</p>
        <Badge variant={ok ? "success" : "warning"} pulse>{ok ? "OK" : "Review"}</Badge>
      </div>
    </div>
  );
}

function PersonalizationPanel({ settings, update }: { settings: AppSettings; update: (settings: Partial<AppSettings>) => Promise<AppSettings> }) {
  return (
    <Panel title="Personalization" icon={Sparkles}>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Display name">
          <Input value={settings.personalization.displayName} onChange={(event) => void update({ personalization: { ...settings.personalization, displayName: event.target.value } })} />
        </Field>
        <Field label="Occupation or role">
          <Input value={settings.personalization.occupation} onChange={(event) => void update({ personalization: { ...settings.personalization, occupation: event.target.value } })} />
        </Field>
        <SelectField value={settings.personalization.responseStyle} label="Response style" onChange={(responseStyle) => void update({ personalization: { ...settings.personalization, responseStyle } })} options={[
          { value: "direct", label: "Direct" },
          { value: "friendly", label: "Friendly" },
          { value: "technical", label: "Technical" }
        ]} />
      </div>
      <Field label="Custom instructions">
        <Textarea className="min-h-40" value={settings.personalization.customInstructions} onChange={(event) => void update({ personalization: { ...settings.personalization, customInstructions: event.target.value } })} />
      </Field>
    </Panel>
  );
}

function AboutPanel() {
  const stack = ["Next.js", "React", "TypeScript", "Dexie", "IndexedDB", "WebLLM", "Web Workers", "Framer Motion", "Tailwind CSS"];
  return (
    <Panel title="About Orion" icon={Info}>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-md border border-border bg-background p-4">
          <p className="text-sm font-medium">Project</p>
          <dl className="mt-3 grid gap-2 text-sm">
            <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Name</dt><dd>Orion</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Version</dt><dd>0.1.0</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Build</dt><dd>Phase 8</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-muted-foreground">License</dt><dd>MIT</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Hackathon</dt><dd>OSDHack 2026</dd></div>
          </dl>
        </div>
        <div className="rounded-md border border-border bg-background p-4">
          <p className="text-sm font-medium">Technology stack</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {stack.map((item) => <Badge key={item} variant="outline">{item}</Badge>)}
          </div>
        </div>
        <div className="rounded-md border border-border bg-background p-4 md:col-span-2">
          <p className="text-sm font-medium">Privacy commitment</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Orion runs inference, document parsing, search, settings, and storage locally in the browser. There is no cloud sync, authentication, telemetry, analytics, or external AI service in this phase.</p>
        </div>
      </div>
    </Panel>
  );
}
