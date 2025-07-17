import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import type { ReactNode } from 'react';
import { baseOptions, linkItems } from '@/app/layout.config';
import { source } from '@/lib/source';
import { LargeSearchToggle } from 'fumadocs-ui/components/layout/search-toggle';
import { ChatButton } from '@/components/chat-button';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      tree={{
        name: 'docs',
        children: source.pageTree.children,
      }}
      {...baseOptions}
      links={linkItems.filter((item) => item.type === 'icon')}
      searchToggle={{
        components: {
          lg: (
            <div className="flex gap-1.5 max-md:hidden">
              <LargeSearchToggle className="flex-1" />
              <ChatButton />
            </div>
          ),
        },
      }}
    >
      {children}
    </DocsLayout>
  );
}
