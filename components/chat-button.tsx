'use client';

import { useState } from 'react';
import { Bot } from 'lucide-react';
import { ChatDialog } from './chat-dialog';

export function ChatButton() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <>
      <button
        onClick={toggleChat}
        className={`inline-flex items-center justify-center rounded-md p-1.5 text-sm font-medium transition-colors duration-100 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none border ${
          isChatOpen
            ? 'bg-fd-accent text-fd-accent-foreground'
            : 'bg-fd-background hover:bg-fd-accent hover:text-fd-accent-foreground'
        } [&_svg]:size-4.5`}
        title="Assistant"
      >
        <Bot />
      </button>

      <ChatDialog isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </>
  );
}
