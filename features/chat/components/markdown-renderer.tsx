"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "@/features/chat/components/code-block";
import { motion } from "framer-motion";
import React from "react";

const remarkPlugins = [remarkGfm];

const Cursor = () => (
  <motion.span
    initial={{ opacity: 0 }}
    animate={{ opacity: [1, 0, 1] }}
    transition={{ duration: 0.8, repeat: Infinity }}
    className="inline-block w-2 h-4 bg-primary ml-1 align-middle rounded-[1px]"
  />
);

function renderWithCursor(children: React.ReactNode) {
  return React.Children.map(children, (child) => {
    if (typeof child === "string" && child.includes("__CURSOR__")) {
      return (
        <>
          {child.replace("__CURSOR__", "")}
          <Cursor />
        </>
      );
    }
    return child;
  });
}

const markdownComponents: any = {
  a: ({ children, ...props }: any) => (
    <a {...props} className="font-medium text-primary underline-offset-4 hover:underline" target="_blank" rel="noreferrer">
      {renderWithCursor(children)}
    </a>
  ),
  p: ({ children, ...props }: any) => (
    <motion.p initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} {...props}>
      {renderWithCursor(children)}
    </motion.p>
  ),
  h1: ({ children, ...props }: any) => <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} {...props}>{renderWithCursor(children)}</motion.h1>,
  h2: ({ children, ...props }: any) => <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} {...props}>{renderWithCursor(children)}</motion.h2>,
  h3: ({ children, ...props }: any) => <motion.h3 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} {...props}>{renderWithCursor(children)}</motion.h3>,
  ul: ({ children, ...props }: any) => <motion.ul variants={{ show: { transition: { staggerChildren: 0.1 } } }} initial="hidden" animate="show" {...props}>{children}</motion.ul>,
  ol: ({ children, ...props }: any) => <motion.ol variants={{ show: { transition: { staggerChildren: 0.1 } } }} initial="hidden" animate="show" {...props}>{children}</motion.ol>,
  li: ({ children, ...props }: any) => <motion.li variants={{ hidden: { opacity: 0, y: 5 }, show: { opacity: 1, y: 0 } }} {...props}>{renderWithCursor(children)}</motion.li>,
  img: ({ alt, ...props }: any) => (
    <motion.span initial={{ opacity: 0, filter: "blur(10px)" }} animate={{ opacity: 1, filter: "blur(0px)" }} className="my-3 block overflow-hidden rounded-lg border border-border bg-secondary">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img {...props} alt={alt ?? ""} className="max-h-80 w-full object-cover" />
    </motion.span>
  ),
  code: ({ className, children, ...props }: any) => {
    const raw = String(children).replace(/\n$/, "");
    const language = /language-(\w+)/.exec(className ?? "")?.[1] ?? "text";
    const inline = !className;

    if (inline) {
      return (
        <code {...props} className="rounded-md bg-secondary px-1.5 py-0.5 text-[0.85em]">
          {renderWithCursor(children)}
        </code>
      );
    }

    return (
      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
        <CodeBlock language={language} code={raw.replace("__CURSOR__", "")} />
      </motion.div>
    );
  },
  table: ({ children }: any) => <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="my-4 overflow-x-auto rounded-lg border border-border"><table className="w-full min-w-96 text-left text-sm">{children}</table></motion.div>,
  tr: ({ children, ...props }: any) => <motion.tr initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} {...props}>{children}</motion.tr>,
  th: ({ children }: any) => <th className="border-b border-border bg-secondary px-3 py-2 font-semibold">{renderWithCursor(children)}</th>,
  td: ({ children }: any) => <td className="border-b border-border px-3 py-2 align-top">{renderWithCursor(children)}</td>
};

export function MarkdownRenderer({ content, isStreaming }: { content: string; isStreaming?: boolean }) {
  const displayContent = isStreaming ? `${content}__CURSOR__` : content;
  return (
    <div className="prose max-w-none text-sm leading-relaxed prose-pre:m-0 [&>*:first-child]:!mt-0 [&>*:last-child]:!mb-0">
      <ReactMarkdown
        remarkPlugins={remarkPlugins as any}
        components={markdownComponents}
      >
        {displayContent}
      </ReactMarkdown>
    </div>
  );
}

