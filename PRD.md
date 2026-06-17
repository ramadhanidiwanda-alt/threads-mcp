# PRD — threads-mcp

## 1. Product Overview

**threads-mcp** is an open-source MCP (Model Context Protocol) server that enables AI agents to research public sentiment, frustrations, and conversations on Meta's Threads platform. It provides tools to retrieve posts, explore comment threads, and search conversations by keyword.

Built as a lightweight, stateless MCP server — deploy once, consume from any MCP-compatible client (Claude Desktop, Hermes, Cursor, etc.).

## 2. Scope

### Phase 1 — Threads (now)
- Threads API only
- 5 MCP tools (see section 4)
- Single auth account
- Docker deployment

### Roadmap
- Instagram comment research
- Other social platforms
- Multi-user auth
- Public HTTP endpoint

## 3. Architecture

```
MCP Client (Claude Desktop / Hermes / Cursor)
        |  stdio
        v
threads-mcp (Node.js, TypeScript, ESM)
        |  HTTP (Graph API)
        v
Meta Threads Graph API (graph.threads.net/v1.0)
```

- **Base URL:** `graph.threads.net/v1.0/`
- **Auth:** Single access token via `THREADS_ACCESS_TOKEN` env var
- **Transport:** MCP stdio

## 4. Tools

| Tool | Description | Endpoint |
|------|-------------|----------|
| `get_post(mediaId)` | Get a single Threads post + metadata | `GET /{media-id}` |
| `get_replies(mediaId, cursor?)` | Get top-level replies (paginated, newest first) | `GET /{media-id}/replies` |
| `get_conversation(mediaId, cursor?)` | Get ALL replies including nested (flattened, paginated) | `GET /{media-id}/conversation` |
| `search_threads(keyword, type?, limit?)` | Search public posts by keyword | `GET /keyword_search` |
| `search_comments(topicKeyword, commentKeyword, maxPosts?)` | Search for comments containing a keyword within topic-related posts | `search_threads` + `get_conversation` (local filter) |

## 5. Output Format

Clean JSON, flat structure, minimal fields:

**Post:**
```json
{
  "id": "12345",
  "text": "post content",
  "username": "author",
  "timestamp": "2026-06-16T10:00:00Z",
  "permalink": "https://threads.com/...",
  "mediaType": "TEXT",
  "hasReplies": true,
  "isReply": false,
  "topicTag": "parenting"
}
```

**Reply:**
```json
{
  "id": "54321",
  "text": "comment text",
  "username": "user123",
  "timestamp": "2026-06-16T10:05:00Z",
  "isReplyTo": null,
  "hasReplies": false,
  "isVerified": false
}
```

## 6. Permissions & Rate Limits

### Required Permissions
- `threads_basic` — for all API calls
- `threads_keyword_search` — for public keyword search (requires Meta app review)

### Rate Limits
- General API: 4,800 x impressions per 24h
- Keyword search: 2,200 queries per 24h per user (across all apps)
- Post publishing: 250 posts per 24h
- Reply publishing: 1,000 replies per 24h

### Restrictions
- Sensitive/offensive keywords return empty array
- Rate limits apply per user across all apps

## 7. Tech Stack

- **Runtime:** Node.js 22, TypeScript (strict mode), ESM
- **Framework:** @modelcontextprotocol/sdk v1
- **Validation:** zod
- **Testing:** Vitest
- **Deploy:** Docker (multi-stage, node:22-alpine)
- **License:** MIT

## 8. Repo Structure

```
threads-mcp/
├── src/
│   ├── index.ts          — MCP server entry point
│   ├── tools/            — 5 tool files
│   └── utils/
│       ├── api.ts        — Threads API client
│       └── types.ts      — shared types
├── tests/
├── Dockerfile + docker-compose.yml
├── package.json + tsconfig.json
├── .env.example
├── PRD.md, AGENTS.md, README.md
└── LICENSE
```

## 9. Deployment

### Phase 1 — Docker
```bash
git clone <repo>
cp .env.example .env  # add THREADS_ACCESS_TOKEN
docker compose up --build
```

### Design Decisions
- Stdio transport (simplest MCP pattern, no HTTP overhead)
- Single auth token (multi-user deferred to roadmap)
- search_comments implemented client-side (no native endpoint)
- Pagination via cursor (delegated to client iteration)
