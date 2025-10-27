interface ScrapedPage {
  markdown: string;
  html: string;
  metadata: any;
}

export async function scrapePage(url: string): Promise<ScrapedPage> {
  const apiKey = process.env.FIRECRAWL_API_KEY;

  if (!apiKey) {
    throw new Error('Firecrawl API key not configured');
  }

  const response = await fetch('https://api.firecrawl.dev/v2/scrape', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      url: url,
      formats: ['markdown', 'html'],
      onlyMainContent: true
    })
  });

  if (!response.ok) {
    throw new Error(`Firecrawl API error: ${response.statusText}`);
  }

  const data = await response.json();

  return {
    markdown: data.data?.markdown || '',
    html: data.data?.html || '',
    metadata: data.data?.metadata || {}
  };
}
