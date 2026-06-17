import { z } from "zod";
import { getPostById } from "../utils/api.js";
import type { MCPToolResponse } from "../utils/types.js";

export const schema = {
  name: "get_post",
  description: "Get a single Threads post by its media ID",
  parameters: z.object({
    mediaId: z.string().describe("The Threads media/post ID"),
  }),
};

export async function handler({ mediaId }: { mediaId: string }): Promise<MCPToolResponse> {
  try {
    const post = await getPostById(mediaId);
    return { content: [{ type: "text", text: JSON.stringify(post, null, 2) }] };
  } catch (e: any) {
    return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
  }
}
