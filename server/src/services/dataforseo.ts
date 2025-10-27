interface TopResult {
  position: number;
  url: string;
  title: string;
}

export async function getTopResults(keyword: string): Promise<TopResult[]> {
  const apiLogin = process.env.DATAFORSEO_LOGIN;
  const apiPassword = process.env.DATAFORSEO_PASSWORD;

  if (!apiLogin || !apiPassword) {
    throw new Error('DataForSEO credentials not configured');
  }

  const auth = Buffer.from(`${apiLogin}:${apiPassword}`).toString('base64');

  const response = await fetch('https://api.dataforseo.com/v3/serp/google/organic/live/advanced', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify([{
      keyword: keyword,
      language_code: 'en',
      location_code: 2840,
      depth: 10
    }])
  });

  if (!response.ok) {
    throw new Error(`DataForSEO API error: ${response.statusText}`);
  }

  const data = await response.json();

  if (data.tasks?.[0]?.result?.[0]?.items) {
    const items = data.tasks[0].result[0].items;
    const organicResults = items
      .filter((item: any) => item.type === 'organic')
      .slice(0, 5)
      .map((item: any) => ({
        position: item.rank_absolute,
        url: item.url,
        title: item.title || ''
      }));

    return organicResults;
  }

  return [];
}
