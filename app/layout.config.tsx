import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { type LinkItemType } from 'fumadocs-ui/layouts/docs';

/**
 * Shared layout configurations
 *
 * you can customise layouts individually from:
 * Home Layout: app/(home)/layout.tsx
 * Docs Layout: app/docs/layout.tsx
 */
// see https://fumadocs.dev/docs/ui/navigation/links

export const linkItems: LinkItemType[] = [
  {
    type: 'icon',
    url: 'https://github.com/iChuck-W/template-website-docs',
    text: 'Github',
    icon: (
      <svg role="img" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
      </svg>
    ),
    external: true,
  },
];

export const baseOptions: BaseLayoutProps = {
  nav: {
    title: (
      <>
        <svg
          width="24"
          height="24"
          viewBox="0 0 48 48"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Logo"
        >
          <g
            fill="none"
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth="4"
          >
            <path
              strokeLinecap="round"
              d="M8 25V38C8 39.6569 9.34315 41 11 41H37C38.6569 41 40 39.6569 40 38V25"
            />
            <path
              fill="#2F88FF"
              d="M5 15C5 13.8954 5.89543 13 7 13H41C42.1046 13 43 13.8954 43 15V23C43 24.1046 42.1046 25 41 25H7C5.89543 25 5 24.1046 5 23V15Z"
            />
            <path
              strokeLinecap="round"
              d="M31 13V9C31 7.89543 30.1046 7 29 7H19C17.8954 7 17 7.89543 17 9V13"
            />
            <path strokeLinecap="round" d="M15 23V29" />
            <path strokeLinecap="round" d="M33 23V29" />
          </g>
        </svg>
        template-website
      </>
    ),
    transparentMode: 'top',
  },
};
