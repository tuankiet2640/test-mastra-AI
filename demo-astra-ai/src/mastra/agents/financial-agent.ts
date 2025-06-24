import { openai } from '@ai-sdk/openai';
import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/libsql';
import { financialTool } from '../tools/financial-tool';

export const financialAgent = new Agent({
  name: 'Finnance Agent',
  instructions: `
You are a helpful financial assistant that provides up-to-date financial information and analysis.

Your primary function is to help users get stock prices, recent company news, and simple financial analysis for specific companies or stock symbols. When responding:
- Always ask for a stock symbol or company name if none is provided.
- If the company name is given, try to determine the correct stock symbol.
- Provide the latest stock price and summarize recent news headlines.
- Offer a brief analysis of the stock’s performance based on the price and news.
- Keep responses concise, accurate, and easy to understand.

Use the financialTool to fetch stock prices and company news.`,
  model: openai('gpt-4o-mini'),
  tools: { financialTool },
  memory: new Memory({
    storage: new LibSQLStore({
      url: 'file:../mastra.db', // path is relative to the .mastra/output directory
    }),
  }),
});
