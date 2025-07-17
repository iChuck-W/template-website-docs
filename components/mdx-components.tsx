import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import { ImageZoom } from 'fumadocs-ui/components/image-zoom';
import { Mermaid } from '@/components/mermaid';

// use this function to get MDX components, you will need it for rendering MDX
export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    Mermaid,
    ...components,
    img: (props) => {
      if (props.src?.startsWith('http')) {
        return <img {...props} />;
      }
      return <ImageZoom {...(props as any)} />;
    },
  };
}
