export type MessageRole = "system" | "user" | "assistant";

export interface ChatMessage {
  id: string;
  chatId: string;
  role: MessageRole;
  content: string;
  markdown?: string;
  createdAt: number;
  updatedAt?: number;
  generationTimeMs?: number | null;
  tokenCount?: number;
  status?: "pending" | "streaming" | "complete" | "error" | "deleted";
  error?: string | null;
  deleted?: boolean;
}

export interface ChatThread {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  pinned: boolean;
  favorite: boolean;
  folderId?: string | null;
  messageCount?: number;
  modelUsed?: string | null;
  lastMessagePreview?: string;
  deleted?: boolean;
}

export type DocumentKind =
  | "pdf"
  | "docx"
  | "txt"
  | "markdown"
  | "csv"
  | "json"
  | "html"
  | "javascript"
  | "typescript"
  | "python"
  | "java"
  | "c"
  | "cpp"
  | "csharp"
  | "go"
  | "rust"
  | "kotlin"
  | "swift"
  | "yaml"
  | "xml"
  | "sql"
  | "log";

export type DocumentProcessingStatus = "queued" | "validating" | "parsing" | "chunking" | "indexing" | "ready" | "error";

export interface OrionDocument {
  id: string;
  name: string;
  kind: DocumentKind;
  mimeType: string;
  size: number;
  content: string;
  previewText: string;
  wordCount: number;
  pageCount: number;
  chunkCount: number;
  tags: string[];
  folderId: string | null;
  favorite: boolean;
  pinned: boolean;
  status: DocumentProcessingStatus;
  progress: number;
  error: string | null;
  lastOpenedAt: number | null;
  binary?: Blob;
  createdAt: number;
  updatedAt: number;
  modifiedAt: number;
}

export interface OrionDocumentChunk {
  id: string;
  documentId: string;
  documentName: string;
  index: number;
  content: string;
  normalizedContent: string;
  tokenEstimate: number;
  wordCount: number;
  pageNumber: number | null;
  sectionTitle: string | null;
  embeddingVector: number[];
  keywords: string[];
  createdAt: number;
}

export interface DocumentFolder {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
}

export interface DocumentSearchHistory {
  id: string;
  query: string;
  documentIds: string[];
  createdAt: number;
}

export interface DocumentSearchResult {
  id: string;
  documentId: string;
  documentName: string;
  chunkId: string;
  chunkIndex: number;
  excerpt: string;
  score: number;
  matchType: "keyword" | "semantic" | "hybrid";
  pageNumber: number | null;
  highlights: string[];
}

export interface DocumentChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
  sourceChunkIds: string[];
}

export interface OrionModel {
  id: string;
  name: string;
  size: string;
  sizeBytes: number;
  contextWindow: number;
  family: string;
  description: string;
  lowResource: boolean;
  vramRequiredMb: number;
}

export interface ModelProgress {
  status: "idle" | "checking" | "downloading" | "paused" | "verifying" | "extracting" | "loading" | "ready" | "unloading" | "error";
  progress: number;
  message: string;
  speedBytesPerSecond?: number;
  etaSeconds?: number;
  startedAt?: number;
}

export interface GenerationSettings {
  temperature: number;
  topP: number;
  topK: number;
  maxTokens: number;
  systemPrompt: string;
}

export type RuntimeBackend = "webgpu" | "wasm" | "unsupported" | "unknown";

export type WorkerStatus = "idle" | "initializing" | "ready" | "busy" | "crashed";

export interface DownloadState {
  modelId: string | null;
  status: "idle" | "checking" | "downloading" | "paused" | "complete" | "error" | "deleted";
  progress: number;
  speedBytesPerSecond: number;
  etaSeconds: number | null;
  sizeBytes: number;
  downloadedBytes: number;
  message: string;
}

export interface GenerationState {
  status: "idle" | "validating" | "streaming" | "stopping" | "complete" | "error";
  activeMessageId: string | null;
  startedAt: number | null;
  firstTokenAt: number | null;
  completedAt: number | null;
  tokenCount: number;
  tokensPerSecond: number;
  latencyMs: number | null;
  error: string | null;
}

export interface RuntimeState {
  backend: RuntimeBackend;
  webllmVersion: string | null;
  workerStatus: WorkerStatus;
  loadedModelId: string | null;
  modelLoadTimeMs: number | null;
  memoryUsageMb: number | null;
  storageUsageBytes: number;
  storageQuotaBytes: number;
  gpuVendor: string | null;
  maxStorageBufferBindingSize: number | null;
  error: string | null;
}

export interface PromptMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AppSettings extends GenerationSettings {
  id: string;
  adminMode: boolean;
  theme: "system" | "light" | "dark";
  language: string;
  preferredModel: string;
  fontSize: "sm" | "md" | "lg";
  autoSave: boolean;
  startupBehavior: "last-session" | "new-chat" | "documents" | "models";
  defaultLandingPage: "home" | "chat" | "documents" | "models" | "settings";
  dateFormat: "system" | "iso" | "short" | "long";
  timeFormat: "system" | "12h" | "24h";
  appearance: {
    accentColor: "blue" | "green" | "violet" | "rose" | "amber";
    chatDensity: "comfortable" | "cozy" | "compact";
    compactMode: boolean;
    roundedCorners: "sm" | "md" | "lg";
    animationSpeed: "reduced" | "normal" | "fast";
    glassEffects: boolean;
    transparency: number;
    sidebarWidth: number;
  };
  ai: {
    contextLength: number;
    streaming: boolean;
    autoLoadLastModel: boolean;
    responseLength: "concise" | "balanced" | "detailed";
    creativityPreset: "precise" | "balanced" | "creative";
    conversationMemory: boolean;
    promptTemplates: PromptTemplate[];
  };
  lastLoadedModel: string | null;
  documents: {
    defaultFolderId: string | null;
    chunkSize: number;
    previewTheme: "system" | "light" | "dark";
    autoIndex: boolean;
    maxFileSizeMb: number;
    documentCache: boolean;
    searchMode: "keyword" | "semantic" | "hybrid";
  };
  privacy: {
    localOnly: true;
    telemetry: false;
    analytics: false;
    crashReports: false;
  };
  personalization: {
    displayName: string;
    occupation: string;
    responseStyle: "direct" | "friendly" | "technical";
    customInstructions: string;
  };
  shortcuts: Record<string, string>;
  accessibility: {
    reduceMotion: boolean;
    announceStreaming: boolean;
    highContrast: boolean;
    keyboardNavigation: boolean;
    screenReaderMode: boolean;
    focusIndicators: boolean;
    fontScaling: number;
    lineHeight: number;
  };
  keyboard: {
    sendShortcut: "mod-enter" | "enter";
    escapeStopsGeneration: boolean;
  };
  updatedAt: number;
}

export interface StoredModelMetadata {
  id: string;
  name: string;
  version: string;
  downloadedSize: number;
  downloadDate: number | null;
  storagePathMetadata: string;
  backendType: RuntimeBackend;
  status: "available" | "downloading" | "downloaded" | "loaded" | "deleted" | "error";
  updatedAt: number;
}

export interface FavoriteRecord {
  id: string;
  targetId: string;
  targetType: "conversation" | "promptTemplate" | "document";
  createdAt: number;
}

export interface FolderRecord {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  deleted?: boolean;
}

export interface PromptTemplate {
  id: string;
  name: string;
  prompt: string;
  category: string;
  favorite: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface RecentSearch {
  id: string;
  query: string;
  scope: "conversations" | "messages" | "all";
  timestamp: number;
  frequency: number;
}

export interface ConversationStatistics {
  id: string;
  conversationId: string;
  messageCount: number;
  userMessageCount: number;
  assistantMessageCount: number;
  totalTokens: number;
  averageGenerationTimeMs: number;
  lastActiveAt: number;
}

export interface BackupMetadata {
  id: string;
  name: string;
  createdAt: number;
  version: number;
  conversationCount: number;
  messageCount: number;
}

export interface DatabaseExport {
  version: number;
  exportedAt: number;
  conversations: ChatThread[];
  messages: ChatMessage[];
  settings: AppSettings[];
  models: StoredModelMetadata[];
  favorites: FavoriteRecord[];
  folders: FolderRecord[];
  promptTemplates: PromptTemplate[];
  recentSearches: RecentSearch[];
  statistics: ConversationStatistics[];
  backups: BackupMetadata[];
}
