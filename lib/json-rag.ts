import { loadContentDB, ContentItem } from './content-db';

export interface SearchSection {
  item: ContentItem;
  score: number;
}

/**
 * Simple keyword search, can be replaced with vector search later
 */
// Extract keywords (mixed Chinese and English)
function extractKeywords(text: string): string[] {
  const keywords: string[] = [];
  const lower = text.toLowerCase();
  // English words
  const english = lower.match(/[a-z0-9]+/g) || [];
  for (const token of english) {
    if (token.length > 1) keywords.push(token);
    // Further split letter and number combinations, e.g. iphone16 => iphone + 16
    const alpha = token.match(/[a-z]+/g) || [];
    const nums = token.match(/[0-9]+/g) || [];
    keywords.push(...alpha, ...nums);
  }
  // Chinese words (simple consecutive characters)
  const chinese = text.match(/[\u4e00-\u9fa5]+/g) || [];
  keywords.push(...chinese);
  return Array.from(new Set(keywords));
}

export async function searchDocs(
  query: string,
  limit = 5,
): Promise<SearchSection[]> {
  const db = await loadContentDB();
  const tokens = extractKeywords(query);

  const scored = db.map((item) => {
    let score = 0;
    const contentLower = item.content.toLowerCase();
    const titleLower = item.title.toLowerCase();
    const descLower = (item.description || '').toLowerCase();

    for (const token of tokens) {
      // keyword list
      if (item.keywords.includes(token)) score += 12;
      // title match high weight
      if (titleLower.includes(token)) score += 15;
      // description match
      if (descLower.includes(token)) score += 6;
      // content match (count occurrences up to 5)
      const regex = new RegExp(
        token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
        'g',
      );
      const matches = (contentLower.match(regex) || []).length;
      score += Math.min(matches, 5) * 3;
    }

    return { item, score } as SearchSection;
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function formatSections(sections: SearchSection[]): string {
  if (sections.length === 0) return '暂无相关文档内容。';
  return sections
    .map((sec, idx) => {
      const { item, score } = sec;
      const preview = item.content.slice(0, 1500);
      return `### 相关文档 ${idx + 1}: ${item.title}\n路径: ${item.path}\n得分: ${score}\n\n${preview}`;
    })
    .join('\n\n');
}
