import { source } from '@/lib/source';
import { createFromSource } from 'fumadocs-core/search/server';
import { createTokenizer } from '@orama/tokenizers/mandarin';
import { stopwords as mandarinStopwords } from '@orama/stopwords/mandarin';
import { stopwords as englishStopwords } from '@orama/stopwords/english';

// https://docs.orama.com/open-source/supported-languages
const mixedTokenizer = createTokenizer({
  language: 'mandarin',
  // Merge Chinese and English stop words
  stopWords: [...mandarinStopwords, ...englishStopwords],
});

export const { GET } = createFromSource(source, {
  // Use custom tokenizer to support both Chinese and English
  components: {
    tokenizer: mixedTokenizer,
  },
});
