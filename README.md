# threads-mcp

MCP server for Threads comment research — analyze public sentiment, frustrations, and conversations on Threads via AI agents.

## Tools

| Tool | Description |
|------|-------------|
| `get_post` | Get a single Threads post by media ID |
| `get_replies` | Get top-level replies for a post (paginated) |
| `get_conversation` | Get ALL replies including nested (flattened, paginated) |
| `search_threads` | Search public Threads posts by keyword |
| `search_comments` | Search for comments containing a keyword within topic-related posts |

## Quick Start

```bash
# 1. install dependencies
npm ci

# 2. set up env
cp .env.example .env
# edit .env — add your THREADS_ACCESS_TOKEN

# 3. build & run
npm run build
npm start
```

## Docker

```bash
docker compose up --build
```

## Requirements

- Node.js 22+
- Meta Developer App with Threads API enabled
- `threads_basic` permission
- `threads_keyword_search` permission (for public keyword search — requires app review)

## License

MIT
