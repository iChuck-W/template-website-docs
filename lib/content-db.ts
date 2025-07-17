import fs from 'fs/promises';
import path from 'path';

// 单条文档结构，需与 generate-content-db.mjs 输出一致
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
 * 读取并缓存 JSON 数据库
 */
export async function loadContentDB(): Promise<ContentItem[]> {
  if (cached) return cached;
  const dbPath = path.join(process.cwd(), 'public', 'data', 'content-db.json');
  const json = await fs.readFile(dbPath, 'utf8');
  cached = JSON.parse(json) as ContentItem[];
  return cached;
}
