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

Provide a detailed, actionable analysis of what is MISSING or WEAK on the user's page compared to the competitors.

CRITICAL: You MUST use this exact format for each recommendation:

**Action:** [What specific change to make]
**Why:** [Why this matters for SEO and ranking]
**Example:** [Concrete example from competitor pages showing how they do this]

Start with an overall assessment paragraph, then organize your analysis into these sections using ## headings:

## Content Gaps
## Content Depth & Quality
## On-Page SEO Elements
## User Experience Features
## Technical SEO

Within each section, list 3-5 specific recommendations using the Action/Why/Example format shown above.

IMPORTANT FORMATTING RULES:
1. Start each recommendation with "**Action:**" on its own line
2. Follow with "**Why:**" on the next line
3. End with "**Example:**" on the third line
4. Leave a blank line between recommendations
5. Use ## for main section headings
6. Keep the overall assessment paragraph at the top brief (2-3 sentences)

Example format:
## Content Gaps

**Action:** Add a comprehensive buyer's guide section comparing different product types
**Why:** All top-ranking competitors include detailed buying guides which help users make informed decisions and increase time on page - a key ranking signal
**Example:** Competitor #1 has a 1,500-word buyer's guide covering features, price ranges, and use cases that doesn't exist on your page

**Action:** [Next recommendation]
**Why:** [Explanation]
**Example:** [Concrete example]`;

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
