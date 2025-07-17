'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { User, Bot } from 'lucide-react';
import type { Message } from '@ai-sdk/react';

interface MessageRendererProps {
  message: Message;
}

export function MessageRenderer({ message }: MessageRendererProps) {
  const isUser = message.role === 'user';

  if (message.role !== 'user' && message.role !== 'assistant') {
    return null;
  }

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-fd-primary/10 flex items-center justify-center">
          <Bot className="w-4 h-4 text-fd-primary" />
        </div>
      )}

      <div
        className={`max-w-[85%] rounded-lg px-4 py-3 ${
          isUser
            ? 'bg-fd-primary text-fd-primary-foreground'
            : 'bg-fd-muted/50 text-fd-foreground border border-fd-border'
        }`}
      >
        {isUser ? (
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{
                p: ({ children }) => (
                  <p className="text-sm leading-relaxed mb-2 last:mb-0">
                    {children}
                  </p>
                ),
                h1: ({ children }) => (
                  <h1 className="text-lg font-semibold mb-2 text-fd-foreground">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-base font-semibold mb-2 text-fd-foreground">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-sm font-semibold mb-1 text-fd-foreground">
                    {children}
                  </h3>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-inside space-y-1 mb-2 text-sm">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside space-y-1 mb-2 text-sm">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="text-sm leading-relaxed">{children}</li>
                ),
                code: ({ children, ...props }) => {
                  const isInline = !props.className?.includes('language-');

                  if (isInline) {
                    return (
                      <code
                        className="bg-fd-muted px-1.5 py-0.5 rounded text-xs font-mono text-fd-accent-foreground"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  }
                  return (
                    <code
                      className="block bg-fd-muted p-3 rounded-md text-xs font-mono overflow-x-auto"
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
                pre: ({ children }) => (
                  <pre className="bg-fd-muted p-3 rounded-md overflow-x-auto mb-2">
                    {children}
                  </pre>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-fd-primary/30 pl-4 italic text-fd-muted-foreground mb-2">
                    {children}
                  </blockquote>
                ),
                a: ({ children, href }) => (
                  <a
                    href={href}
                    className="text-fd-primary hover:text-fd-primary/80 underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {children}
                  </a>
                ),
                table: ({ children }) => (
                  <div className="overflow-x-auto mb-2">
                    <table className="min-w-full border-collapse border border-fd-border text-xs">
                      {children}
                    </table>
                  </div>
                ),
                th: ({ children }) => (
                  <th className="border border-fd-border px-2 py-1 bg-fd-muted font-semibold text-left">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="border border-fd-border px-2 py-1">
                    {children}
                  </td>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-fd-primary flex items-center justify-center">
          <User className="w-4 h-4 text-fd-primary-foreground" />
        </div>
      )}
    </div>
  );
}
