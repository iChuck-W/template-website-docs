import type { ReactNode } from 'react';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { baseOptions } from '@/app/layout.config';
import Link from 'fumadocs-core/link';
import {
  NavbarMenu,
  NavbarMenuContent,
  NavbarMenuLink,
  NavbarMenuTrigger,
} from 'fumadocs-ui/layouts/home/navbar';
import { Book } from 'lucide-react';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <HomeLayout
      {...baseOptions}
      style={
        {
          '--spacing-fd-container': '1120px',
        } as object
      }
      links={[
        {
          type: 'custom',
          on: 'nav',
          children: (
            <NavbarMenu>
              <NavbarMenuTrigger>
                <Link href="/docs/documentation">Documentation</Link>
              </NavbarMenuTrigger>
              <NavbarMenuContent>
                <NavbarMenuLink
                  href="/docs/documentation"
                  className="block p-4"
                >
                  <div className="flex items-start gap-3">
                    <Book className="bg-fd-primary text-fd-primary-foreground p-2 rounded-md flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm">Introduction</p>
                      <p className="text-fd-muted-foreground text-xs mt-1">
                        Product Documentation Template
                      </p>
                    </div>
                  </div>
                </NavbarMenuLink>
              </NavbarMenuContent>
            </NavbarMenu>
          ),
        },
      ]}
    >
      {children}
    </HomeLayout>
  );
}
