import { smoothStream, streamText } from 'ai';
import { deepseek } from '@ai-sdk/deepseek';
import { ChatSDKError } from '@/lib/errors';
import { searchDocs, formatSections } from '@/lib/json-rag';

export const maxDuration = 60;

const isProductionEnvironment = process.env.NODE_ENV === 'production';

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const systemPromptTemplate = `
你是一个专业的文档助手，专门帮助用户理解和使用项目文档。

## 工作原则：
1. 优先基于下面提供的文档内容回答问题
2. 如果文档中没有相关信息，请明确说明并提供一般性建议
3. 回答要准确、专业、有帮助
4. 可以引用具体的文档页面和链接
5. 支持中英文交流

## 相关文档内容：
{context}

请基于上述文档内容，专业地回答用户的问题。如果文档中没有相关信息，请说明并提供一般性的帮助。
`;

export async function POST(request: Request) {
  try {
    const json = await request.json();
    console.log('Received request body:', json);

    const { messages } = json;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response('Invalid request: messages array is required', {
        status: 400,
      });
    }

    // 获取最后一条用户消息作为检索查询
    const lastMessage = messages[messages.length - 1];
    const userQuery = lastMessage?.role === 'user' ? lastMessage.content : '';

    console.log('🔍 Starting RAG retrieval for query:', userQuery);

    // 使用 JSON RAG 检索相关文档
    let documentContext = '暂无相关文档内容。';
    if (userQuery && userQuery.trim().length > 0) {
      try {
        const sections = await searchDocs(userQuery.trim(), 5);

        if (sections.length > 0) {
          documentContext = formatSections(sections);
          console.log(`✅ RAG found ${sections.length} relevant sections`);
        } else {
          console.log('⚠️ RAG found no relevant sections');
        }
      } catch (ragError) {
        console.error('❌ RAG search failed:', ragError);
      }
    }

    // 构建增强的系统提示词
    const enhancedSystemPrompt = systemPromptTemplate.replace(
      '{context}',
      documentContext,
    );

    console.log('🤖 Sending enhanced prompt to AI model');
    console.log('Context length:', documentContext.length);
    console.log('documentContext:', documentContext);

    const result = streamText({
      model: deepseek('deepseek-chat'),
      system: enhancedSystemPrompt,
      messages,
      experimental_transform: smoothStream({ chunking: 'word' }),
      experimental_generateMessageId: generateUUID,
      experimental_telemetry: {
        isEnabled: isProductionEnvironment,
        functionId: 'stream-text',
      },
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Chat API error:', error);
    if (error instanceof ChatSDKError) {
      return error.toResponse();
    }
    return new Response('Internal Server Error', { status: 500 });
  }
}
