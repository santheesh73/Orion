"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "@/features/chat/components/code-block";

export function MarkdownRenderer({ content, isStreaming }: { content: string; isStreaming?: boolean }) {
  const displayContent = isStreaming ? `${content} ▌` : content;
  return (
    <div className="prose max-w-none text-sm leading-relaxed prose-pre:m-0 [&>*:first-child]:!mt-0 [&>*:last-child]:!mb-0">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ children, ...props }) => (
            <a {...props} className="font-medium text-primary underline-offset-4 hover:underline" target="_blank" rel="noreferrer">
              {children}
            </a>
          ),
          img: ({ alt, ...props }) => (
            <span className="my-3 block overflow-hidden rounded-lg border border-border bg-secondary">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img {...props} alt={alt ?? ""} className="max-h-80 w-full object-cover" />
            </span>
          ),
          code: ({ className, children, ...props }) => {
            const raw = String(children).replace(/\n$/, "");
            const language = /language-(\w+)/.exec(className ?? "")?.[1] ?? "text";
            const inline = !className;

            if (inline) {
              return (
                <code {...props} className="rounded-md bg-secondary px-1.5 py-0.5 text-[0.85em]">
                  {children}
                </code>
              );
            }

            return <CodeBlock language={language} code={raw} />;
          },
          table: ({ children }) => <div className="my-4 overflow-x-auto rounded-lg border border-border"><table className="w-full min-w-96 text-left text-sm">{children}</table></div>,
          th: ({ children }) => <th className="border-b border-border bg-secondary px-3 py-2 font-semibold">{children}</th>,
          td: ({ children }) => <td className="border-b border-border px-3 py-2 align-top">{children}</td>
        }}
      >
        {displayContent}
      </ReactMarkdown>
    </div>
  );
}
