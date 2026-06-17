import { z } from "zod";
import { searchByKeyword, getConversation } from "../utils/api.js";
import type { MCPToolResponse, ThreadReply } from "../utils/types.js";

export const schema = {
  name: "search_comments",
  description:
    "Search for specific comments containing a keyword within Threads posts that match a given topic. Calls search_threads then fetches conversations for matching posts.",
  parameters: z.object({
    topicKeyword: z.string().describe("Topic keyword to find relevant Threads posts"),
    commentKeyword: z.string().describe("Keyword to filter comments by"),
    maxPosts: z.number().optional().default(5).describe("Max posts to scan for comments (1-20)"),
  }),
};

export async function handler({
  topicKeyword,
  commentKeyword,
  maxPosts = 5,
}: {
  topicKeyword: string;
  commentKeyword: string;
  maxPosts?: number;
}): Promise<MCPToolResponse> {
  try {
    // 1. search threads by topic
    const search = await searchByKeyword(topicKeyword, { type: "RECENT", limit: maxPosts });

    const postsWithReplies = search.posts.filter((p) => p.hasReplies);
    const limited = postsWithReplies.slice(0, Math.min(maxPosts, 20));

    // 2. fetch conversations for each post & filter by keyword
    const results: Array<{ postId: string; postText: string; username: string; matchedComments: ThreadReply[] }> = [];

    for (const post of limited) {
      let allReplies: ThreadReply[] = [];
      let cursor: string | undefined;
      let page = 0;

      while (page < 5) {
        const conv = await getConversation(post.id, cursor);
        allReplies = allReplies.concat(conv.replies);
        if (!conv.nextCursor) break;
        cursor = conv.nextCursor;
        page++;
      }

      const matched = allReplies.filter((r) =>
        r.text.toLowerCase().includes(commentKeyword.toLowerCase()),
      );

      if (matched.length > 0) {
        results.push({
          postId: post.id,
          postText: post.text.slice(0, 200),
          username: post.username,
          matchedComments: matched,
        });
      }
    }

    const payload = {
      topicKeyword,
      commentKeyword,
      postsScanned: limited.length,
      totalMatchedComments: results.reduce((s, r) => s + r.matchedComments.length, 0),
      results,
    };

    return { content: [{ type: "text", text: JSON.stringify(payload, null, 2) }] };
  } catch (e: any) {
    return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
  }
}
