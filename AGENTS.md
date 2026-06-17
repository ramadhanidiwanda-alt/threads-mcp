# AGENTS.md — threads-mcp

## Project Overview

Threads comment research MCP server. AI agents use its tools to discover public sentiment, frustrations, and conversations on Meta's Threads platform. Built as a lightweight, stateless MCP server — deploy once, consume from any MCP-compatible client.

## Tech Stack

- **Runtime:** Node.js 22 (ESM, TypeScript)
- **Framework:** @modelcontextprotocol/sdk (stdio transport)
- **Validation:** zod
- **API:** Meta Threads Graph API (graph.threads.net/v1.0)
- **Build:** TypeScript to dist/
- **Deploy:** Docker (node:22-alpine, multi-stage)

## Architecture

MCP Client → stdio → threads-mcp → HTTP → Meta Threads Graph API

Pattern: each tool in src/tools/ exports { schema, handler }. Server in src/index.ts auto-registers all tools.

## File Structure

```
src/
├── index.ts          — MCP server entry point
├── tools/            — 5 tool files
│   ├── getPost.ts
│   ├── getReplies.ts
│   ├── getConversation.ts
│   ├── searchThreads.ts
│   └── searchComments.ts
└── utils/
    ├── api.ts        — Threads API client
    └── types.ts      — shared types
tests/
Dockerfile + docker-compose.yml
package.json + tsconfig.json
.env.example
PRD.md, AGENTS.md, README.md, LICENSE
```

## Code Style

- TypeScript strict mode, ESM
- Named exports only (no default exports)
- Tool files export `schema` and `handler`
- Async/await, error responses return `isError: true`
- Clean JSON output — flat, minimal fields

## Development

- `npm run dev` — hot-reload with tsx
- `npm run build` — compile to dist/
- Add tool: create `src/tools/yourTool.ts`, register in `src/index.ts`
- `npm test` — Vitest tests in `tests/`

## Build and Deploy

```
npm run build
docker compose up
```

## API Rate Limits

- General: 4,800 x impressions per 24h
- Keyword search: 2,200 queries per 24h per user
- Sensitive keywords return empty array
- Paginated results — use cursor for full data
