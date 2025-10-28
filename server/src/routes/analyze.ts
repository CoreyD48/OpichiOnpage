import { Router, Request, Response } from 'express';
import { getTopResults } from '../services/dataforseo.js';
import { scrapePage } from '../services/firecrawl.js';
import { analyzePages } from '../services/gemini.js';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  const { keyword, url } = req.body;

  if (!keyword || !url) {
    return res.status(400).json({ error: 'Keyword and URL are required' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const sendProgress = (message: string, data?: any) => {
    const payload = { message, data };
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  };

  try {
    sendProgress('Starting analysis...');

    sendProgress('Searching for top 5 organic results...');
    const topResults = await getTopResults(keyword);
    sendProgress('Found top ranking pages', { count: topResults.length });

    sendProgress('Scraping competitor pages...');
    const competitorPages = [];
    for (let i = 0; i < topResults.length; i++) {
      const result = topResults[i];
      sendProgress(`Scraping page ${i + 1} of ${topResults.length}: ${result.url}`);
      try {
        const scraped = await scrapePage(result.url);
        competitorPages.push({
          url: result.url,
          title: result.title,
          position: result.position,
          ...scraped
        });
      } catch (error: any) {
        sendProgress(`Failed to scrape ${result.url}: ${error.message}. Skipping...`);
        console.error(`Failed to scrape ${result.url}:`, error.message);
      }
    }

    sendProgress('Scraping your page...');
    const yourPage = await scrapePage(url);
    sendProgress('Your page scraped successfully');

    sendProgress('Analyzing pages with AI...');
    const analysis = await analyzePages(keyword, yourPage, competitorPages, sendProgress);

    sendProgress('Analysis complete!', { finalAnalysis: analysis });

    res.write(`data: ${JSON.stringify({ message: '[DONE]', data: { finalAnalysis: analysis } })}\n\n`);
    res.end();
  } catch (error: any) {
    sendProgress('Error occurred', { error: error.message });
    res.write(`data: ${JSON.stringify({ message: '[ERROR]', data: { error: error.message } })}\n\n`);
    res.end();
  }
});

export default router;
