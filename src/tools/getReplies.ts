import { z } from "zod";
import { getReplies } from "../utils/api.js";
import type { MCPToolResponse } from "../utils/types.js";

export const schema = {
  name: "get_replies",
  description: "Get top-level replies for a Threads post (paginated, newest first)",
  parameters: z.object({
    mediaId: z.string().describe("The Threads media/post ID"),
    cursor: z.string().optional().describe("Pagination cursor from previous response"),
  }),
};

export async function handler({
  mediaId,
  cursor,
}: {
  mediaId: string;
  cursor?: string;
}): Promise<MCPToolResponse> {
  try {
    const result = await getReplies(mediaId, cursor);
    const payload = {
      replies: result.replies,
      nextCursor: result.nextCursor,
      hasMore: !!result.nextCursor,
    };
    return { content: [{ type: "text", text: JSON.stringify(payload, null, 2) }] };
  } catch (e: any) {
    return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
  }
}
