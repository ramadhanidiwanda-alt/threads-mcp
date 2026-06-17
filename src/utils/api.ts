import { ThreadPost, ThreadReply, SearchResult } from "./types.js";

const BASE = process.env.THREADS_API_BASE || "https://graph.threads.net/v1.0";
const TOKEN = process.env.THREADS_ACCESS_TOKEN || "";

async function fetcher<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${BASE}${path}`);
  url.searchParams.set("access_token", TOKEN);
  for (const [k, v] of Object.entries(params)) {
    if (v) url.searchParams.set(k, v);
  }
  const res = await fetch(url.toString());
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Threads API ${res.status}: ${body}`);
  }
  return res.json() as Promise<T>;
}

// ── get single post ──────────────────────────────────
export async function getPostById(id: string): Promise<ThreadPost> {
  const data = await fetcher<any>(`/${id}`, {
    fields:
      "id,text,username,timestamp,permalink,media_type,has_replies,is_reply,root_post,replied_to,topic_tag",
  });
  return mapPost(data);
}

// ── get top-level replies ────────────────────────────
export async function getReplies(
  id: string,
  cursor?: string,
): Promise<{ replies: ThreadReply[]; nextCursor?: string }> {
  const params: Record<string, string> = {
    fields:
      "id,text,username,timestamp,permalink,has_replies,is_reply,replied_to,is_verified",
    reverse: "true",
  };
  if (cursor) params.after = cursor;

  const data = await fetcher<any>(`/${id}/replies`, params);
  return {
    replies: (data.data || []).map(mapReply),
    nextCursor: data.paging?.cursors?.after,
  };
}

// ── get all replies (conversation, flattened) ────────
export async function getConversation(
  id: string,
  cursor?: string,
): Promise<{ replies: ThreadReply[]; nextCursor?: string }> {
  const params: Record<string, string> = {
    fields:
      "id,text,username,timestamp,permalink,has_replies,is_reply,replied_to,is_verified",
    reverse: "true",
  };
  if (cursor) params.after = cursor;

  const data = await fetcher<any>(`/${id}/conversation`, params);
  return {
    replies: (data.data || []).map(mapReply),
    nextCursor: data.paging?.cursors?.after,
  };
}

// ── keyword search ──────────────────────────────────
export async function searchByKeyword(
  keyword: string,
  opts: { type?: "TOP" | "RECENT"; limit?: number } = {},
): Promise<SearchResult> {
  const params: Record<string, string> = {
    q: keyword,
    search_type: opts.type || "TOP",
    fields:
      "id,text,username,timestamp,permalink,media_type,has_replies,is_reply,topic_tag",
  };
  if (opts.limit) params.limit = String(opts.limit);

  const data = await fetcher<any>("/keyword_search", params);
  return {
    posts: (data.data || []).map(mapPost),
    totalResults: data.data?.length || 0,
    nextCursor: data.paging?.cursors?.after,
  };
}

// ── mappers ──────────────────────────────────────────
function mapPost(d: any): ThreadPost {
  return {
    id: d.id,
    text: d.text || "",
    username: d.username,
    timestamp: d.timestamp,
    permalink: d.permalink,
    mediaType: d.media_type || "TEXT",
    hasReplies: d.has_replies === true,
    isReply: d.is_reply === true,
    rootPost: d.root_post || undefined,
    repliedTo: d.replied_to || undefined,
    topicTag: d.topic_tag || undefined,
  };
}

function mapReply(d: any): ThreadReply {
  return {
    id: d.id,
    text: d.text || "",
    username: d.username,
    timestamp: d.timestamp,
    permalink: d.permalink,
    isReplyTo: d.replied_to || null,
    hasReplies: d.has_replies === true,
    isVerified: d.is_verified === true,
  };
}
