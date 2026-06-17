export interface ThreadPost {
  id: string;
  text: string;
  username: string;
  timestamp: string;
  permalink: string;
  mediaType: "TEXT" | "IMAGE" | "VIDEO";
  replyCount?: number;
  likeCount?: number;
  hasReplies: boolean;
  isReply: boolean;
  rootPost?: string;
  repliedTo?: string;
  topicTag?: string;
}

export interface ThreadReply {
  id: string;
  text: string;
  username: string;
  timestamp: string;
  permalink?: string;
  isReplyTo?: string | null;
  hasReplies: boolean;
  isVerified: boolean;
}

export interface SearchResult {
  posts: ThreadPost[];
  totalResults: number;
  nextCursor?: string;
}

export interface MCPToolResponse {
  content: Array<{ type: "text"; text: string }>;
  isError?: boolean;
}
