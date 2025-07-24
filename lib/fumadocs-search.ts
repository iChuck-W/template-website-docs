export interface SearchResult {
  id: string;
  title: string;
  content: string;
  url: string;
  type: string;
  section?: string;
}

export interface MultiSearchResult {
  query: string;
  results: SearchResult[];
  resultCount: number;
}

/**
 * Use simple rules to split complex questions
 * @param query Original query
 * @returns Array of split questions
 */
export function splitComplexQuery(query: string): string[] {
  const queries: string[] = [];

  const normalizedQuery = query.trim();

  // Common separators for splitting multiple questions
  const separators = [
    '还有',
    '另外',
    '以及',
    '和',
    '与',
    '或者',
    '或',
    '同时',
    '还想知道',
    '还想了解',
    '还有就是',
    'and',
    'also',
    'plus',
    'additionally',
    'furthermore',
  ];

  // Detect multiple questions separated by question marks
  if (normalizedQuery.includes('？') || normalizedQuery.includes('?')) {
    const parts = normalizedQuery
      .split(/[？?]/)
      .filter((part) => part.trim().length > 0);
    if (parts.length > 1) {
      queries.push(...parts.map((part) => part.trim()));
      return queries;
    }
  }

  // Detect multiple questions separated by common separators
  for (const separator of separators) {
    if (normalizedQuery.includes(separator)) {
      const parts = normalizedQuery
        .split(new RegExp(separator, 'i'))
        .filter((part) => part.trim().length > 0);
      if (parts.length > 1) {
        queries.push(...parts.map((part) => part.trim()));
        return queries;
      }
    }
  }

  // Detect multiple questions separated by commas or semicolons (when length is sufficient)
  if (normalizedQuery.length > 20) {
    const commaParts = normalizedQuery
      .split(/[，,；;]/)
      .filter((part) => part.trim().length > 5);
    if (commaParts.length > 1) {
      queries.push(...commaParts.map((part) => part.trim()));
      return queries;
    }
  }

  // If cannot split, return original query
  queries.push(normalizedQuery);
  return queries;
}

/**
 * Use Fumadocs search API to search document content
 * @param query Search query
 * @param limit Number of results to return
 * @returns Array of search results
 */
export async function searchWithFumadocs(
  query: string,
  limit: number = 5,
): Promise<SearchResult[]> {
  try {
    const searchUrl = new URL(
      '/api/search',
      process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
    );
    searchUrl.searchParams.set('query', query);

    const response = await fetch(searchUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(
        `Search API returned ${response.status}: ${response.statusText}`,
      );
    }

    const data = await response.json();

    // Process search results, limit number of results
    const results: SearchResult[] = (data.results || data || [])
      .slice(0, limit)
      .map((item: any, index: number) => {
        // Fumadocs API returns data structure: { id, type, content, url }
        // Title information is in the first line of content
        const title = item.content
          ? item.content.split('\n')[0].trim()
          : '无标题';

        return {
          id: item.id || `result-${index}`,
          title: title,
          content: item.content || '',
          url: item.url || '#',
          type: item.type || 'document',
          section: item.section,
        };
      });

    return results;
  } catch (error) {
    console.error('Fumadocs search error:', error);
    return [];
  }
}

/**
 * Multi-question intelligent search
 * @param query Original query (may contain multiple questions)
 * @param limitPerQuery Limit of results per sub-question
 * @param maxQueries Maximum number of questions to split
 * @returns Multi-search result object
 */
export async function multiQuestionSearch(
  query: string,
  limitPerQuery: number = 3,
  maxQueries: number = 3,
): Promise<MultiSearchResult[]> {
  const subQueries = splitComplexQuery(query).slice(0, maxQueries);
  const searchPromises = subQueries.map(async (subQuery) => {
    const results = await searchWithFumadocs(subQuery, limitPerQuery);
    return {
      query: subQuery,
      results,
      resultCount: results.length,
    };
  });

  const multiResults = await Promise.all(searchPromises);

  // Filter out searches with no results
  return multiResults.filter((result) => result.resultCount > 0);
}

/**
 * Deduplicate search results (based on URL and title)
 * @param results Search result array
 * @returns Deduplicated results
 */
export function deduplicateResults(results: SearchResult[]): SearchResult[] {
  const seen = new Set<string>();
  return results.filter((result) => {
    const key = `${result.url}|${result.title}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

/**
 * Format multiple search results for AI processing
 * @param multiResults Array of multi-search results
 * @returns Formatted document context string
 */
export function formatMultiSearchResultsForAI(
  multiResults: MultiSearchResult[],
): string {
  if (!multiResults || multiResults.length === 0) {
    return '暂无相关文档内容。';
  }

  // Merge all results and deduplicate
  const allResults = multiResults.flatMap((mr) => mr.results);
  const uniqueResults = deduplicateResults(allResults);

  if (uniqueResults.length === 0) {
    return '暂无相关文档内容。';
  }

  let formattedText = '以下是相关的文档内容：\n\n';

  // If multiple search queries, display query information
  if (multiResults.length > 1) {
    const queryInfo = multiResults
      .map(
        (mr, index) =>
          `${index + 1}. "${mr.query}" (找到 ${mr.resultCount} 个结果)`,
      )
      .join('\n');
    formattedText += `## Search query analysis\n${queryInfo}\n\n`;
  }

  const formattedResults = uniqueResults
    .map((result, index) => {
      const sectionInfo = result.section ? ` (${result.section})` : '';
      const urlInfo = result.url !== '#' ? `\n链接: ${result.url}` : '';

      return `## 文档 ${index + 1}: ${result.title}${sectionInfo}

${result.content.trim()}${urlInfo}

---`;
    })
    .join('\n\n');

  formattedText += formattedResults;
  formattedText +=
    '\n\n请基于以上文档内容回答用户的问题。如果文档中没有直接相关的信息，请说明并提供一般性的建议。';

  return formattedText;
}

/**
 * Format search results for AI processing (single search version)
 * @param results Search result array
 * @returns Formatted document context string
 */
export function formatSearchResultsForAI(results: SearchResult[]): string {
  if (!results || results.length === 0) {
    return '暂无相关文档内容。';
  }

  const formattedResults = results
    .map((result, index) => {
      const sectionInfo = result.section ? ` (${result.section})` : '';
      const urlInfo = result.url !== '#' ? `\n链接: ${result.url}` : '';

      return `## 文档 ${index + 1}: ${result.title}${sectionInfo}

${result.content.trim()}${urlInfo}

---`;
    })
    .join('\n\n');

  return `以下是相关的文档内容：

${formattedResults}

请基于以上文档内容回答用户的问题。如果文档中没有直接相关的信息，请说明并提供一般性的建议。`;
}

/**
 * Intelligent search and format results convenience function
 * @param query Search query
 * @param enableMultiSearch Whether to enable multi-question search
 * @param limit Result quantity limit
 * @returns Formatted document context
 */
export async function searchAndFormat(
  query: string,
  enableMultiSearch: boolean = true,
  limit: number = 5,
): Promise<string> {
  if (enableMultiSearch) {
    const multiResults = await multiQuestionSearch(
      query,
      Math.ceil(limit / 2),
      3,
    );

    if (multiResults.length > 1) {
      // console.log(`🔍 Multi-question search: split into ${multiResults.length} queries`);
      return formatMultiSearchResultsForAI(multiResults);
    }
  }

  // console.log('🔍 Single-question search');
  const results = await searchWithFumadocs(query, limit);
  return formatSearchResultsForAI(results);
}
