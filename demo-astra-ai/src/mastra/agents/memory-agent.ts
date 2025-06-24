import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { openai } from "@ai-sdk/openai";
import { LibSQLStore } from "@mastra/libsql";
 
// Initialize memory with LibSQLStore for persistence
const memory = new Memory({
  storage: new LibSQLStore({
    url: "file:../mastra.db", // Or your database URL
  }),
});
 
export const myMemoryAgent = new Agent({
  name: "MemoryAgent",
  instructions: "...",
  model: openai("gpt-4o"),
  memory,
});
