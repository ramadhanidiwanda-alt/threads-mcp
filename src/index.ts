import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import "dotenv/config";

import * as getPost from "./tools/getPost.js";
import * as getReplies from "./tools/getReplies.js";
import * as getConversation from "./tools/getConversation.js";
import * as searchThreads from "./tools/searchThreads.js";
import * as searchComments from "./tools/searchComments.js";

const tools = [getPost, getReplies, getConversation, searchThreads, searchComments];

const server = new Server(
  { name: "threads-mcp", version: "0.1.0" },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: tools.map((t) => ({
    name: t.schema.name,
    description: t.schema.description,
    inputSchema: t.schema.parameters instanceof z.ZodType
      ? t.schema.parameters
      : { type: "object", properties: t.schema.parameters },
  })),
}));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const tool = tools.find((t) => t.schema.name === req.params.name);
  if (!tool) {
    return {
      content: [{ type: "text", text: `Unknown tool: ${req.params.name}` }],
      isError: true,
    };
  }
  const args = req.params.arguments ?? {};
  return tool.handler(args);
});

const transport = new StdioServerTransport();
await server.connect(transport);
