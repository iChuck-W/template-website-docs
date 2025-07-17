import fs from 'fs/promises';
import path from 'path';

// Single document structure, must match generate-content-db.mjs output
export interface ContentItem {
  id: string;
  title: string;
  description: string;
  path: string;
  content: string;
  keywords: string[];
  frontmatter?: Record<string, unknown>;
  lastModified: string;
}

let cached: ContentItem[] | null = null;

/**
 * Read and cache JSON database
 */
export async function loadContentDB(): Promise<ContentItem[]> {
  if (cached) return cached;
  const dbPath = path.join(process.cwd(), 'public', 'data', 'content-db.json');
  const json = await fs.readFile(dbPath, 'utf8');
  cached = JSON.parse(json) as ContentItem[];
  return cached;
}
