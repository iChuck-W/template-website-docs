import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Process MDX content, remove unnecessary components and formatted text
function processMdxContent(content) {
  return (
    content
      // Remove import statements
      .replace(/^import.*?;\n/gm, '')
      // Remove JSX component tags
      .replace(/<([A-Z][a-zA-Z]*|[a-z]+(\s+[^>]*)?)>/g, '')
      .replace(/<\/[^>]+>/g, '')
      // Remove extra empty lines
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  );
}

// Generate title from filename
function generateTitle(filename) {
  return filename
    .replace('.mdx', '')
    .replace(/_/g, ' ')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Parse frontmatter
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};

  const frontmatter = {};
  const lines = match[1].split('\n');

  lines.forEach((line) => {
    const [key, ...values] = line.split(':').map((s) => s.trim());
    if (key && values.length) {
      const value = values.join(':').replace(/^["']|["']$/g, '');
      frontmatter[key] = value;
    }
  });

  return frontmatter;
}

// Separate frontmatter and content
function separateMdxContent(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { frontmatter: {}, content };

  return {
    frontmatter: parseFrontmatter(content),
    content: match[2]?.trim() || '',
  };
}

// Read MDX file content
async function readMdxContent(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return content;
  } catch (error) {
    console.error(`读取文件失败 ${filePath}:`, error);
    return null;
  }
}

async function generateContentDB() {
  try {
    console.log('开始生成内容数据库...');

    const docsDir = join(projectRoot, 'content', 'docs', 'documentation');
    const files = await fs.readdir(docsDir);

    const contentDB = await Promise.all(
      files
        .filter((file) => file.endsWith('.mdx'))
        .map(async (file) => {
          const filePath = join(docsDir, file);
          const content = await readMdxContent(filePath);

          if (!content) return null;

          const { frontmatter, content: mdxContent } =
            separateMdxContent(content);
          const processedContent = processMdxContent(mdxContent);
          const title = frontmatter.title || generateTitle(file);
          const description = frontmatter.description || '';

          // Extract keywords
          const keywords = new Set(
            [
              title,
              ...title.split(' '),
              description,
              ...(frontmatter.keywords || '').split(',').map((k) => k.trim()),
              file.replace('.mdx', '').replace(/_/g, ' '),
            ]
              .filter(Boolean)
              .map((k) => k.toLowerCase()),
          );

          return {
            id: file.replace('.mdx', ''),
            title,
            description,
            path: `documentation/${file}`,
            content: processedContent,
            frontmatter,
            keywords: Array.from(keywords),
            lastModified: new Date().toISOString(),
          };
        }),
    );

    // Filter out failed processing files
    const validContent = contentDB.filter((item) => item !== null);

    // Ensure public/data directory exists
    const dataDir = join(projectRoot, 'public', 'data');
    await fs.mkdir(dataDir, { recursive: true });

    // Write JSON file
    const dbPath = join(dataDir, 'content-db.json');
    await fs.writeFile(dbPath, JSON.stringify(validContent, null, 2), {
      encoding: 'utf8',
    });

    console.log(`成功生成内容数据库，共 ${validContent.length} 个文件`);
    console.log(`数据库文件位置: ${dbPath}`);

    // Verify generated JSON file
    const verification = JSON.parse(await fs.readFile(dbPath, 'utf8'));
    console.log('数据库验证成功，内容结构完整');
    console.log('示例条目:', JSON.stringify(verification[0], null, 2));
  } catch (error) {
    console.error('生成内容数据库失败:', error);
    process.exit(1);
  }
}

generateContentDB();
