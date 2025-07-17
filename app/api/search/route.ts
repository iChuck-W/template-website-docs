import { source } from '@/lib/source';
import { createFromSource } from 'fumadocs-core/search/server';
import { createTokenizer } from '@orama/tokenizers/mandarin';
import { stopwords as mandarinStopwords } from '@orama/stopwords/mandarin';
import { stopwords as englishStopwords } from '@orama/stopwords/english';

// https://docs.orama.com/open-source/supported-languages
const mixedTokenizer = createTokenizer({
  language: 'mandarin',
  // 合并中英文停用词
  stopWords: [...mandarinStopwords, ...englishStopwords],
});

export const { GET } = createFromSource(source, {
  // 使用自定义中文分词器，同时支持中英文搜索
  components: {
    tokenizer: mixedTokenizer,
  },
});
