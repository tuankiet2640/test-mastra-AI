import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const financialTool = createTool({
  id: 'get-financial-info',
  description: 'Get current stock price and recent news for a stock symbol',
  inputSchema: z.object({
    symbol: z.string().describe('Stock symbol, e.g. AAPL'),
  }),
  outputSchema: z.object({
    price: z.number(),
    news: z.array(z.object({
      headline: z.string(),
      url: z.string().optional(),
      datetime: z.string().optional(),
    })),
  }),
  execute: async ({ context }) => {
    const symbol = context.symbol;
    const apiKey = process.env.FINNHUB_API_KEY || 'YOUR_API_KEY';

    // Get stock price
    const priceUrl = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`;
    const priceRes = await fetch(priceUrl);
    const priceData = await priceRes.json();
    if (!priceData || priceData.c === undefined) {
      console.error('Finnhub price API error:', priceData);
    }
    const price = priceData.c || 0;

    // Get company news
    const today = new Date();
    const from = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      .toISOString().slice(0, 10);
    const to = today.toISOString().slice(0, 10);
    const newsUrl = `https://finnhub.io/api/v1/company-news?symbol=${symbol}&from=${from}&to=${to}&token=${apiKey}`;
    const newsRes = await fetch(newsUrl);
    const newsData = await newsRes.json();
    if (!Array.isArray(newsData)) {
      console.error('Finnhub news API error:', newsData);
    }

    const news = Array.isArray(newsData)
      ? newsData.slice(0, 3).map((n: any) => ({
          headline: n.headline,
          url: n.url,
          datetime: n.datetime,
        }))
      : [];

    return { price, news };
  },
});