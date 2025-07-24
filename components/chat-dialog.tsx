'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '@ai-sdk/react';
import { Bot, X, Send } from 'lucide-react';
import { MessageRenderer } from './message-renderer';

interface ChatDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChatDialog({ isOpen, onClose }: ChatDialogProps) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    status,
    setMessages,
    stop,
  } = useChat({
    api: '/api/chat',
    onError: (error) => {
      console.error('Chat error:', error);
    },
    onFinish: () => {},
  });

  const isLoading = status === 'submitted';

  useEffect(() => {
    if (isOpen && !sessionId) {
      const existingSessionId = localStorage.getItem('chat-session-id');
      if (existingSessionId) {
        setSessionId(existingSessionId);
        loadMessages(existingSessionId);
      } else {
        const newSessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('chat-session-id', newSessionId);
        setSessionId(newSessionId);
      }
    }
  }, [isOpen, sessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  useEffect(() => {
    if (sessionId && messages.length > 0) {
      saveMessages(messages);
    }
  }, [messages, sessionId]);

  const loadMessages = (sessionId: string) => {
    const savedMessages = localStorage.getItem(`chat-messages-${sessionId}`);
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        setMessages(parsedMessages);
      } catch (error) {
        console.error('Failed to load messages:', error);
      }
    }
  };

  const saveMessages = (messages: any[]) => {
    if (!sessionId) return;
    localStorage.setItem(
      `chat-messages-${sessionId}`,
      JSON.stringify(messages),
    );
    localStorage.setItem(
      `chat-last-active-${sessionId}`,
      new Date().toISOString(),
    );
  };

  const clearHistory = () => {
    if (!sessionId) return;

    // Always stop any ongoing streaming response, regardless of isLoading state
    // This ensures we stop even if the state hasn't updated yet
    stop();

    // Clear messages immediately
    setMessages([]);

    // Create a new session to avoid any race conditions
    const newSessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Clean up old session
    localStorage.removeItem(`chat-messages-${sessionId}`);
    localStorage.removeItem(`chat-last-active-${sessionId}`);

    // Set new session
    localStorage.setItem('chat-session-id', newSessionId);
    setSessionId(newSessionId);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-80 z-50">
      <div className="h-full p-2 bg-fd-secondary/50 rounded-xl animate-fd-dialog-in">
        <div className="h-full rounded-xl overflow-hidden border shadow-lg bg-fd-popover text-fd-popover-foreground flex flex-col">
          {/* Header */}
          <div className="flex items-center gap-2 p-4 border-b border-fd-border">
            <Bot className="w-5 h-5 text-fd-primary" />
            <h3 className="font-semibold text-fd-foreground">Assistant</h3>
          </div>

          {/* Message area */}
          <div className="flex-1 overflow-y-auto p-4">
            {messages.length === 0 ? (
              // Empty state welcome interface
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Bot className="w-12 h-12 text-fd-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium text-fd-foreground mb-2">
                  AI Assistant
                </h3>
                <p className="text-sm text-fd-muted-foreground mb-4 max-w-[200px]">
                  Ask me anything about the documentation
                </p>
                <div className="text-xs text-fd-muted-foreground/70">
                  Type your question below to get started
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg, index) => (
                  <MessageRenderer key={index} message={msg} />
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-fd-muted text-fd-muted-foreground rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-fd-primary"></div>
                        <span className="text-sm">AI 正在思考...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input area */}
          <div className="p-4">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={handleInputChange}
                placeholder="请输入你的问题..."
                className="flex-1 h-10 rounded-md border border-fd-border bg-fd-background px-3 py-2 text-sm text-fd-foreground placeholder:text-fd-muted-foreground focus:outline-none focus:ring-2 focus:ring-fd-ring focus:border-transparent"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="inline-flex items-center justify-center rounded-md p-2 text-sm font-medium transition-colors duration-100 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none bg-fd-primary text-fd-primary-foreground hover:bg-fd-primary/80 w-10 h-10 [&_svg]:size-4"
              >
                <Send />
              </button>
            </form>
          </div>

          {/* Bottom info bar */}
          <div className="flex gap-2 items-center text-fd-muted-foreground px-3 py-1.5 border-t border-fd-border">
            <div className="text-xs flex-1">
              AI 可能会出错，请验证信息的准确性。
            </div>
            {messages.length > 0 && (
              <>
                <button
                  onClick={clearHistory}
                  className="inline-flex items-center justify-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors duration-100 hover:bg-fd-accent hover:text-fd-accent-foreground focus-visible:outline-none"
                >
                  清空
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="inline-flex items-center justify-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors duration-100 hover:bg-fd-accent hover:text-fd-accent-foreground focus-visible:outline-none [&_svg]:size-3"
            >
              <X />
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
