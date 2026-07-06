"use client";

import { useEffect, useMemo, useRef, useState, type ClipboardEvent, type DragEvent } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import {
  Bot,
  Clock,
  Edit3,
  FileArchive,
  FileCode2,
  FileJson,
  FileText,
  Folder,
  FolderInput,
  GripVertical,
  MessageSquareText,
  Pin,
  Search,
  Send,
  Sparkles,
  Star,
  Tag,
  Trash2,
  Upload
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useDocumentChat } from "@/hooks/useDocumentChat";
import { useDocuments } from "@/hooks/useDocuments";
import { usePreview } from "@/hooks/usePreview";
import { useSearch } from "@/hooks/useSearch";
import { useUpload } from "@/hooks/useUpload";
import { cn } from "@/lib/utils/cn";
import { documentLanguage, formatFileSize, highlightText, searchResultLabel } from "@/services/document/preview.service";
import { useOrionStore } from "@/store/orion-store";
import type { OrionDocument } from "@/types/orion";

const codeKinds = new Set<OrionDocument["kind"]>([
  "javascript",
  "typescript",
  "python",
  "java",
  "c",
  "cpp",
  "csharp",
  "go",
  "rust",
  "kotlin",
  "swift",
  "yaml",
  "json",
  "xml",
  "sql",
  "html"
]);

export function DocumentPanel() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);
  const [managerQuery, setManagerQuery] = useState("");
  const [previewQuery, setPreviewQuery] = useState("");
  const [chatPrompt, setChatPrompt] = useState("");
  const [sortMode, setSortMode] = useState<"recent" | "name" | "size">("recent");
  const {
    documents,
    folders,
    selectedDocumentIds,
    loading,
    toggleSelected,
    setSelectedDocumentIds,
    rename,
    setFavorite,
    setPinned,
    updateTags,
    moveToFolder,
    createFolder,
    deleteDocument
  } =
    useDocuments();
  const { uploadFiles, isDragging, isUploading, setIsDragging } = useUpload();
  const { query, setQuery, results, history, isSearching, runSearch } = useSearch();
  const { messages, isGenerating, activeSources, ask } = useDocumentChat();
  const { chunks } = usePreview(activeDocumentId);
  const processing = useOrionStore((state) => state.documentProcessing);

  const activeDocument = documents.find((document) => document.id === activeDocumentId) ?? documents[0] ?? null;
  const selectedCount = selectedDocumentIds.length;

  const filteredDocuments = useMemo(() => {
    const normalized = managerQuery.trim().toLowerCase();
    const filtered = documents.filter((document) => {
      const haystack = `${document.name} ${document.kind} ${document.tags.join(" ")}`.toLowerCase();
      return !normalized || haystack.includes(normalized);
    });
    return filtered.sort((a, b) => {
      if (a.pinned !== b.pinned) {
        return a.pinned ? -1 : 1;
      }
      if (sortMode === "name") {
        return a.name.localeCompare(b.name);
      }
      if (sortMode === "size") {
        return b.size - a.size;
      }
      return b.updatedAt - a.updatedAt;
    });
  }, [documents, managerQuery, sortMode]);

  const recentDocuments = documents
    .filter((document) => document.lastOpenedAt)
    .sort((a, b) => (b.lastOpenedAt ?? 0) - (a.lastOpenedAt ?? 0))
    .slice(0, 4);

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    void uploadFiles(event.dataTransfer.files);
  }

  function onPaste(event: ClipboardEvent<HTMLDivElement>) {
    const files = Array.from(event.clipboardData.files);
    if (files.length > 0) {
      void uploadFiles(files);
    }
  }

  async function submitChat(mode: Parameters<typeof ask>[1] = "ask") {
    const prompt = chatPrompt.trim() || (mode === "summarize" ? "Summarize the selected documents." : "");
    if (!prompt) {
      return;
    }
    setChatPrompt("");
    await ask(prompt, mode);
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 pb-20 pt-5 sm:px-6 lg:pb-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-4">
        <section
          className={cn(
            "rounded-lg border border-dashed bg-card p-4 shadow-soft transition sm:p-5",
            isDragging ? "border-primary bg-primary/5" : "border-border"
          )}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          onPaste={onPaste}
          tabIndex={0}
          aria-label="Upload documents by click, drag and drop, folder picker, or paste"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                className="grid size-12 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground"
                animate={{ scale: isDragging ? 1.06 : 1 }}
              >
                <Upload className="size-5" />
              </motion.div>
              <div>
                <h1 className="text-heading-4">Local Document Intelligence</h1>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                  Process PDFs, DOCX, text, data, code, and logs in this browser with local parsing, indexing, preview, search, and WebLLM chat.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="primary" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                <Upload />
                Upload
              </Button>
              <Button type="button" variant="outline" onClick={() => folderInputRef.current?.click()} disabled={isUploading}>
                <FolderInput />
                Folder
              </Button>
              <input ref={fileInputRef} className="sr-only" type="file" multiple onChange={(event) => void uploadFiles(event.target.files ?? [])} />
              <input
                ref={folderInputRef}
                className="sr-only"
                type="file"
                multiple
                // @ts-expect-error Chromium exposes folder upload through this browser-only attribute.
                webkitdirectory=""
                onChange={(event) => void uploadFiles(event.target.files ?? [])}
              />
            </div>
          </div>
          {Object.entries(processing).length > 0 ? (
            <div className="mt-4 grid gap-2 md:grid-cols-2">
              {Object.entries(processing).map(([id, item]) => (
                <div key={id} className="rounded-md border border-border bg-background p-3">
                  <div className="mb-2 flex items-center justify-between gap-3 text-xs">
                    <span className="truncate text-muted-foreground">{item.message}</span>
                    <span className="font-medium">{item.progress}%</span>
                  </div>
                  <Progress value={item.progress} />
                </div>
              ))}
            </div>
          ) : null}
        </section>

        <div className="grid gap-4 xl:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="rounded-lg border border-border bg-card shadow-soft">
            <div className="border-b border-border p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">Documents</p>
                  <p className="text-xs text-muted-foreground">{documents.length} stored locally</p>
                </div>
                <Badge variant={selectedCount > 0 ? "primary" : "default"}>{selectedCount} selected</Badge>
              </div>
              <div className="mt-3 flex gap-2">
                <Input value={managerQuery} onChange={(event) => setManagerQuery(event.target.value)} placeholder="Search files" aria-label="Search document manager" />
                <select
                  className="h-10 rounded-md border border-input bg-background px-2 text-sm"
                  value={sortMode}
                  onChange={(event) => setSortMode(event.target.value as typeof sortMode)}
                  aria-label="Sort documents"
                >
                  <option value="recent">Recent</option>
                  <option value="name">Name</option>
                  <option value="size">Size</option>
                </select>
              </div>
              <div className="mt-3 flex gap-2">
                <Button type="button" size="sm" variant="secondary" onClick={() => setSelectedDocumentIds(documents.map((document) => document.id))}>
                  All
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => setSelectedDocumentIds([])}>
                  Clear
                </Button>
              </div>
            </div>
            <div className="max-h-[760px] overflow-y-auto p-2 scrollbar-subtle">
              {loading ? <p className="p-4 text-sm text-muted-foreground">Loading local documents...</p> : null}
              {filteredDocuments.map((document) => (
                <DocumentRow
                  key={document.id}
                  document={document}
                  active={activeDocument?.id === document.id}
                  selected={selectedDocumentIds.includes(document.id)}
                  onOpen={() => setActiveDocumentId(document.id)}
                  onSelect={() => toggleSelected(document.id)}
                  onFavorite={() => void setFavorite(document, !document.favorite)}
                  onPin={() => void setPinned(document, !document.pinned)}
                  onDelete={() => void deleteDocument(document.id)}
                />
              ))}
              {!loading && filteredDocuments.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">No local documents match this view.</div>
              ) : null}
            </div>
          </aside>

          <main className="min-w-0 rounded-lg border border-border bg-card shadow-soft">
            <Tabs defaultValue="preview">
              <div className="flex flex-col gap-3 border-b border-border p-4 md:flex-row md:items-center md:justify-between">
                <TabsList>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                  <TabsTrigger value="search">Search</TabsTrigger>
                  <TabsTrigger value="chat">Chat</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                </TabsList>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="success">Local only</Badge>
                  <span>{activeDocument ? `${activeDocument.chunkCount} chunks` : "No document open"}</span>
                </div>
              </div>

              <TabsContent value="preview" className="mt-0">
                <PreviewPane document={activeDocument} chunks={chunks} previewQuery={previewQuery} setPreviewQuery={setPreviewQuery} />
              </TabsContent>

              <TabsContent value="search" className="mt-0">
                <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_320px]">
                  <div>
                    <div className="flex gap-2">
                      <Input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") void runSearch();
                        }}
                        placeholder="Search by keyword or meaning"
                        aria-label="Search inside documents"
                      />
                      <Button type="button" onClick={() => void runSearch()} disabled={isSearching}>
                        <Search />
                        Search
                      </Button>
                    </div>
                    <div className="mt-4 space-y-3">
                      {results.map((result) => (
                        <button
                          key={result.id}
                          type="button"
                          className="w-full rounded-md border border-border bg-background p-3 text-left transition hover:border-primary/50"
                          onClick={() => setActiveDocumentId(result.documentId)}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <p className="truncate text-sm font-medium">{result.documentName}</p>
                            <Badge variant={result.matchType === "semantic" ? "accent" : "primary"}>{Math.round(result.score * 100)}%</Badge>
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">{searchResultLabel(result)}</p>
                          <p className="mt-2 text-sm leading-6">{result.excerpt}</p>
                        </button>
                      ))}
                      {results.length === 0 ? <EmptyInline icon={Search} text="Run a search to rank local document chunks." /> : null}
                    </div>
                  </div>
                  <ContextPanel recentDocuments={recentDocuments} activeSources={activeSources} searchHistory={history} onSearch={(nextQuery) => void runSearch(nextQuery)} />
                </div>
              </TabsContent>

              <TabsContent value="chat" className="mt-0">
                <div className="grid min-h-[620px] gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_320px]">
                  <div className="flex min-h-[560px] flex-col rounded-md border border-border bg-background">
                    <div className="flex-1 space-y-3 overflow-y-auto p-4 scrollbar-subtle">
                      {messages.map((message) => (
                        <div key={message.id} className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}>
                          <div
                            className={cn(
                              "max-w-[86%] rounded-md px-3 py-2 text-sm leading-6",
                              message.role === "user" ? "bg-primary text-primary-foreground" : "border border-border bg-card"
                            )}
                          >
                            {message.content || "Thinking..."}
                          </div>
                        </div>
                      ))}
                      {messages.length === 0 ? <EmptyInline icon={MessageSquareText} text="Ask, summarize, explain, translate, or extract action items from selected documents." /> : null}
                    </div>
                    <div className="border-t border-border p-3">
                      <div className="mb-2 flex flex-wrap gap-2">
                        <Button type="button" size="sm" variant="secondary" onClick={() => void submitChat("summarize")}>
                          <Sparkles />
                          Summarize
                        </Button>
                        <Button type="button" size="sm" variant="secondary" onClick={() => void submitChat("key-points")}>
                          <FileText />
                          Key points
                        </Button>
                        <Button type="button" size="sm" variant="secondary" onClick={() => void submitChat("actions")}>
                          <Clock />
                          Actions
                        </Button>
                      </div>
                      <div className="flex gap-2">
                        <Textarea
                          value={chatPrompt}
                          onChange={(event) => setChatPrompt(event.target.value)}
                          onKeyDown={(event) => {
                            if ((event.metaKey || event.ctrlKey) && event.key === "Enter") void submitChat("ask");
                          }}
                          placeholder="Ask about selected documents"
                          aria-label="Document chat prompt"
                          className="min-h-16"
                        />
                        <Button type="button" size="icon" aria-label="Send document chat message" onClick={() => void submitChat("ask")} disabled={isGenerating}>
                          <Send />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <ContextPanel recentDocuments={recentDocuments} activeSources={activeSources} searchHistory={history} onSearch={(nextQuery) => void runSearch(nextQuery)} />
                </div>
              </TabsContent>

              <TabsContent value="details" className="mt-0">
                <DetailsPane
                  document={activeDocument}
                  selectedCount={selectedCount}
                  folders={folders}
                  onRename={(document, name) => void rename(document, name)}
                  onUpdateTags={(document, tags) => void updateTags(document, tags)}
                  onMoveToFolder={(document, folderId) => void moveToFolder(document, folderId)}
                  onCreateFolder={createFolder}
                />
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </div>
  );
}

function DocumentRow({
  document,
  active,
  selected,
  onOpen,
  onSelect,
  onFavorite,
  onPin,
  onDelete
}: {
  document: OrionDocument;
  active: boolean;
  selected: boolean;
  onOpen: () => void;
  onSelect: () => void;
  onFavorite: () => void;
  onPin: () => void;
  onDelete: () => void;
}) {
  const Icon = iconFor(document.kind);
  return (
    <motion.div layout className={cn("mb-2 rounded-md border p-3 transition", active ? "border-primary bg-primary/5" : "border-border bg-background")}>
      <div className="flex items-start gap-3">
        <Checkbox checked={selected} onChange={onSelect} aria-label={`Select ${document.name}`} />
        <button type="button" className="min-w-0 flex-1 text-left" onClick={onOpen}>
          <div className="flex items-center gap-2">
            <Icon className="size-4 shrink-0 text-muted-foreground" />
            <p className="truncate text-sm font-medium">{document.name}</p>
          </div>
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span>{document.kind.toUpperCase()}</span>
            <span>{formatFileSize(document.size)}</span>
            <span>{document.wordCount.toLocaleString()} words</span>
          </div>
        </button>
        <div className="flex shrink-0 gap-1">
          <Button type="button" size="icon" variant="ghost" aria-label="Pin document" onClick={onPin}>
            <Pin className={cn(document.pinned && "fill-current text-primary")} />
          </Button>
          <Button type="button" size="icon" variant="ghost" aria-label="Favorite document" onClick={onFavorite}>
            <Star className={cn(document.favorite && "fill-current text-warning")} />
          </Button>
          <Button type="button" size="icon" variant="ghost" aria-label="Delete document" onClick={onDelete}>
            <Trash2 />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

function PreviewPane({
  document,
  chunks,
  previewQuery,
  setPreviewQuery
}: {
  document: OrionDocument | null;
  chunks: Array<{ content: string }>;
  previewQuery: string;
  setPreviewQuery: (value: string) => void;
}) {
  if (!document) {
    return <EmptyInline icon={Upload} text="Upload a document to open the local preview." className="m-6" />;
  }

  const previewText = chunks.map((chunk) => chunk.content).join("\n\n") || document.content;
  const terms = previewQuery.trim().split(/\s+/).filter(Boolean);
  const language = documentLanguage(document);

  return (
    <div className="p-4">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <h2 className="truncate text-heading-4">{document.name}</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {document.pageCount} page{document.pageCount === 1 ? "" : "s"} - {document.chunkCount} chunks - {document.status}
          </p>
        </div>
        <Input value={previewQuery} onChange={(event) => setPreviewQuery(event.target.value)} placeholder="Highlight in preview" aria-label="Search inside preview" className="md:max-w-xs" />
      </div>
      <div className="max-h-[660px] overflow-y-auto rounded-md border border-border bg-background p-4 scrollbar-subtle">
        {document.kind === "pdf" ? (
          <div className="space-y-4">
            <PdfObject document={document} />
            <pre className="whitespace-pre-wrap border-t border-border pt-4 text-sm leading-7">
              {highlightText(previewText, terms).map((part, index) => (
                <mark key={`${part.text}-${index}`} className={part.highlight ? "rounded bg-warning/30 px-0.5 text-foreground" : "bg-transparent text-inherit"}>
                  {part.text}
                </mark>
              ))}
            </pre>
          </div>
        ) : document.kind === "markdown" ? (
          <div className="prose max-w-none text-sm">
            <ReactMarkdown>{previewText}</ReactMarkdown>
          </div>
        ) : codeKinds.has(document.kind) ? (
          <SyntaxHighlighter language={language} style={atomDark} customStyle={{ margin: 0, borderRadius: 8 }}>
            {previewText}
          </SyntaxHighlighter>
        ) : (
          <pre className="whitespace-pre-wrap text-sm leading-7">
            {highlightText(previewText, terms).map((part, index) => (
              <mark key={`${part.text}-${index}`} className={part.highlight ? "rounded bg-warning/30 px-0.5 text-foreground" : "bg-transparent text-inherit"}>
                {part.text}
              </mark>
            ))}
          </pre>
        )}
      </div>
    </div>
  );
}

function PdfObject({ document }: { document: OrionDocument }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!document.binary) {
      setUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(document.binary);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [document]);

  if (!url) {
    return <EmptyInline icon={FileText} text="PDF text was extracted locally. The original file preview is unavailable for this imported record." />;
  }

  return (
    <object data={url} type="application/pdf" className="h-[520px] w-full rounded-md border border-border bg-secondary">
      <iframe src={url} title={document.name} className="h-[520px] w-full rounded-md border-0" />
    </object>
  );
}

function ContextPanel({
  recentDocuments,
  activeSources,
  searchHistory,
  onSearch
}: {
  recentDocuments: OrionDocument[];
  activeSources: Array<{ documentName: string; score: number; chunkIndex: number }>;
  searchHistory: Array<{ id: string; query: string }>;
  onSearch: (query: string) => void;
}) {
  return (
    <aside className="space-y-4">
      <div className="rounded-md border border-border bg-background p-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <GripVertical className="size-4" />
          Context
        </div>
        <div className="mt-3 space-y-2">
          {activeSources.map((source) => (
            <div key={`${source.documentName}-${source.chunkIndex}`} className="rounded-md bg-secondary p-2 text-xs">
              <p className="truncate font-medium">{source.documentName}</p>
              <p className="mt-1 text-muted-foreground">Chunk {source.chunkIndex + 1} - {Math.round(source.score * 100)}%</p>
            </div>
          ))}
          {activeSources.length === 0 ? <p className="text-xs leading-5 text-muted-foreground">Search or chat will assemble ranked chunks here.</p> : null}
        </div>
      </div>
      <div className="rounded-md border border-border bg-background p-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Clock className="size-4" />
          Recent
        </div>
        <div className="mt-3 space-y-2">
          {recentDocuments.map((document) => (
            <div key={document.id} className="truncate rounded-md bg-secondary px-2 py-1.5 text-xs">
              {document.name}
            </div>
          ))}
          {recentDocuments.length === 0 ? <p className="text-xs leading-5 text-muted-foreground">Opened documents will appear here.</p> : null}
        </div>
      </div>
      <div className="rounded-md border border-border bg-background p-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Search className="size-4" />
          Search history
        </div>
        <div className="mt-3 space-y-2">
          {searchHistory.map((item) => (
            <button
              key={item.id}
              type="button"
              className="w-full truncate rounded-md bg-secondary px-2 py-1.5 text-left text-xs transition hover:bg-hover"
              onClick={() => onSearch(item.query)}
            >
              {item.query}
            </button>
          ))}
          {searchHistory.length === 0 ? <p className="text-xs leading-5 text-muted-foreground">Local search queries will appear here.</p> : null}
        </div>
      </div>
    </aside>
  );
}

function DetailsPane({
  document,
  selectedCount,
  folders,
  onRename,
  onUpdateTags,
  onMoveToFolder,
  onCreateFolder
}: {
  document: OrionDocument | null;
  selectedCount: number;
  folders: Array<{ id: string; name: string }>;
  onRename: (document: OrionDocument, name: string) => void;
  onUpdateTags: (document: OrionDocument, tags: string[]) => void;
  onMoveToFolder: (document: OrionDocument, folderId: string | null) => void;
  onCreateFolder: (name: string) => Promise<{ id: string; name: string }>;
}) {
  const [name, setName] = useState("");
  const [tags, setTags] = useState("");
  const [newFolderName, setNewFolderName] = useState("");

  useEffect(() => {
    setName(document?.name ?? "");
    setTags(document?.tags.join(", ") ?? "");
    setNewFolderName("");
  }, [document?.id, document?.name, document?.tags]);

  if (!document) {
    return <EmptyInline icon={FileText} text="Open a document to inspect metadata." className="m-6" />;
  }
  const items = [
    ["Type", document.kind.toUpperCase()],
    ["Size", formatFileSize(document.size)],
    ["Words", document.wordCount.toLocaleString()],
    ["Pages", document.pageCount.toLocaleString()],
    ["Chunks", document.chunkCount.toLocaleString()],
    ["Selected", selectedCount.toLocaleString()],
    ["Created", new Date(document.createdAt).toLocaleString()],
    ["Modified", new Date(document.modifiedAt).toLocaleString()]
  ];
  return (
    <div className="space-y-4 p-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(([label, value]) => (
          <div key={label} className="rounded-md border border-border bg-background p-4">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-2 break-words text-sm font-medium">{value}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-md border border-border bg-background p-4">
          <label className="flex items-center gap-2 text-sm font-medium" htmlFor="document-name">
            <Edit3 className="size-4" />
            Rename
          </label>
          <div className="mt-3 flex gap-2">
            <Input id="document-name" value={name} onChange={(event) => setName(event.target.value)} />
            <Button type="button" onClick={() => onRename(document, name)} disabled={!name.trim() || name.trim() === document.name}>
              Save
            </Button>
          </div>
        </div>
        <div className="rounded-md border border-border bg-background p-4">
          <label className="flex items-center gap-2 text-sm font-medium" htmlFor="document-tags">
            <Tag className="size-4" />
            Tags
          </label>
          <div className="mt-3 flex gap-2">
            <Input id="document-tags" value={tags} onChange={(event) => setTags(event.target.value)} placeholder="research, invoices" />
            <Button type="button" onClick={() => onUpdateTags(document, tags.split(","))}>
              Save
            </Button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {document.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
        <div className="rounded-md border border-border bg-background p-4">
          <label className="flex items-center gap-2 text-sm font-medium" htmlFor="document-folder">
            <Folder className="size-4" />
            Folder
          </label>
          <select
            id="document-folder"
            className="mt-3 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={document.folderId ?? ""}
            onChange={(event) => onMoveToFolder(document, event.target.value || null)}
          >
            <option value="">No folder</option>
            {folders.map((folder) => (
              <option key={folder.id} value={folder.id}>
                {folder.name}
              </option>
            ))}
          </select>
          <div className="mt-3 flex gap-2">
            <Input value={newFolderName} onChange={(event) => setNewFolderName(event.target.value)} placeholder="New folder" />
            <Button
              type="button"
              variant="secondary"
              onClick={async () => {
                const trimmed = newFolderName.trim();
                if (!trimmed) {
                  return;
                }
                const folder = await onCreateFolder(trimmed);
                onMoveToFolder(document, folder.id);
                setNewFolderName("");
              }}
            >
              Add
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyInline({ icon: Icon, text, className }: { icon: typeof Bot; text: string; className?: string }) {
  return (
    <div className={cn("grid min-h-48 place-items-center rounded-md border border-dashed border-border bg-background p-6 text-center", className)}>
      <div>
        <Icon className="mx-auto size-7 text-muted-foreground" />
        <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">{text}</p>
      </div>
    </div>
  );
}

function iconFor(kind: OrionDocument["kind"]) {
  if (codeKinds.has(kind)) {
    return FileCode2;
  }
  if (kind === "json") {
    return FileJson;
  }
  if (kind === "csv") {
    return FileArchive;
  }
  return FileText;
}
