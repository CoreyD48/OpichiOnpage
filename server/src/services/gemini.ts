import { GoogleGenerativeAI } from '@google/generative-ai';

interface CompetitorPage {
  url: string;
  title: string;
  position: number;
  markdown: string;
  html: string;
}

interface YourPage {
  markdown: string;
  html: string;
}

export async function analyzePages(
  keyword: string,
  yourPage: YourPage,
  competitorPages: CompetitorPage[],
  sendProgress: (message: string, data?: any) => void
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('Gemini API key not configured');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  sendProgress('Preparing content for AI analysis...');

  const competitorContent = competitorPages.map((page, idx) => `
### Competitor ${idx + 1} (Position ${page.position}): ${page.title}
URL: ${page.url}

${page.markdown.slice(0, 15000)}
  `).join('\n\n---\n\n');

  const yourContent = yourPage.markdown.slice(0, 15000);

  const prompt = `You are an expert SEO analyst. Analyze the following pages and provide actionable insights.

TARGET KEYWORD: "${keyword}"

YOUR PAGE CONTENT:
${yourContent}

---

TOP RANKING COMPETITOR PAGES:
${competitorContent}

---

TASK:
Compare the user's page against the top-ranking competitor pages for the keyword "${keyword}".

Provide a detailed, actionable checklist of what is MISSING or WEAK on the user's page compared to the competitors. Focus on:

1. **Content Gaps**: Topics, subtopics, or keywords covered by competitors but missing from the user's page
2. **Content Depth**: Areas where competitors provide more detailed information
3. **Structured Data**: Schema markup or structured data present on competitor pages
4. **On-Page Elements**: Missing or weak title tags, meta descriptions, headers (H1, H2, etc.)
5. **User Experience**: Features like FAQs, tables, lists, images that competitors use
6. **Internal Linking**: Link patterns or site structure elements
7. **Content Format**: Better use of formatting, multimedia, or interactive elements

For each item in the checklist:
- Be specific and actionable
- Explain WHY it matters for ranking
- Provide concrete examples from the competitor pages

Format your response as a clear, numbered checklist with sections. Make it comprehensive but easy to follow.`;

  sendProgress('Streaming AI analysis...');

  const result = await model.generateContentStream(prompt);

  let fullAnalysis = '';
  for await (const chunk of result.stream) {
    const chunkText = chunk.text();
    fullAnalysis += chunkText;
    sendProgress('AI streaming analysis...', { analysisChunk: chunkText, totalLength: fullAnalysis.length });
  }

  return fullAnalysis;
}
