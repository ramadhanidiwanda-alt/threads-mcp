import { z } from "zod";
import { searchByKeyword } from "../utils/api.js";
import type { MCPToolResponse } from "../utils/types.js";

export const schema = {
  name: "search_threads",
  description: "Search public Threads posts by keyword — returns matching posts",
  parameters: z.object({
    keyword: z.string().describe("Keyword or phrase to search for"),
    type: z.enum(["TOP", "RECENT"]).optional().default("TOP").describe("TOP = most popular, RECENT = newest first"),
    limit: z.number().optional().describe("Max results to return (default: API limit)"),
  }),
};

export async function handler({
  keyword,
  type,
  limit,
}: {
  keyword: string;
  type?: "TOP" | "RECENT";
  limit?: number;
}): Promise<MCPToolResponse> {
  try {
    const result = await searchByKeyword(keyword, { type, limit });
    const payload = {
      keyword,
      posts: result.posts,
      totalResults: result.totalResults,
      nextCursor: result.nextCursor,
      hasMore: !!result.nextCursor,
    };
    return { content: [{ type: "text", text: JSON.stringify(payload, null, 2) }] };
  } catch (e: any) {
    return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
  }
}
