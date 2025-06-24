import { openai } from '@ai-sdk/openai';
import { Agent } from '@mastra/core/agent';
import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';
import { financialTool } from '../tools/financial-tool';

const llm = openai('gpt-4o-mini');

const agent = new Agent({
  name: 'Financial Agent',
  model: llm,
  instructions: `
    You are a financial assistant. Given a stock symbol, provide the current price, summarize recent news, and offer a brief analysis of the stock's performance and outlook.
    - If no symbol is provided, ask for one.
    - If news is available, mention the most relevant headlines.
    - Keep your response concise and easy to understand.
    Use the financialTool to fetch data.
  `,
  tools: { financialTool },
});

const financialDataSchema = z.object({
  price: z.number(),
  news: z.array(
    z.object({
      headline: z.string(),
      url: z.string().optional(),
      datetime: z.string().optional(),
    })
  ),
});

const fetchFinancialData = createStep({
  id: 'fetch-financial-data',
  description: 'Fetches current stock price and recent news for a given symbol',
  inputSchema: z.object({
    symbol: z.string().describe('The stock symbol to get financial data for'),
  }),
  outputSchema: financialDataSchema,
  execute: async ({ inputData }) => {
    if (!inputData) throw new Error('Input data not found');
return await financialTool.execute({ input: { symbol: inputData.symbol } });  },
});

const analyzeFinancials = createStep({
  id: 'analyze-financials',
  description: 'Analyzes stock price and news, and generates a summary',
  inputSchema: financialDataSchema,
  outputSchema: z.object({
    analysis: z.string(),
  }),
  execute: async ({ inputData }) => {
    if (!inputData) throw new Error('Financial data not found');
    const prompt = `Given the following stock data, provide a brief analysis and summary for an investor:\n${JSON.stringify(inputData, null, 2)}`;
    const response = await agent.stream([
      {
        role: 'user',
        content: prompt,
      },
    ]);
    let analysisText = '';
    for await (const chunk of response.textStream) {
      analysisText += chunk;
    }
    return { analysis: analysisText };
  },
});

const financialWorkflow = createWorkflow({
  id: 'financial-workflow',
  inputSchema: z.object({
    symbol: z.string().describe('The stock symbol to get financial data for'),
  }),
  outputSchema: z.object({
    analysis: z.string(),
  }),
})
  .then(fetchFinancialData)
  .then(analyzeFinancials);

financialWorkflow.commit();

export { financialWorkflow };