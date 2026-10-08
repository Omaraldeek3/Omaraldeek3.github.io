<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Knowledge graph (graphify) — use it first, save tokens

A graphify knowledge graph of this project lives in `graphify-out/` (`GRAPH_REPORT.md`, `graph.json`, `graph.html`).

- Before answering any question about architecture, file relationships, or "where is X / what calls Y", read `graphify-out/GRAPH_REPORT.md` first, then query the graph instead of grepping or reading many files:
  `graphify query "<question>"`, `graphify path "A" "B"`, `graphify explain "<node>"`.
- Open raw source files only for the specific files the graph points to (use `source_location`).
- After changing code, refresh the graph: `graphify update .` (AST only, no LLM cost).
- Graph covers code only (`src`, `tests`, `scripts`, `svg-studio`, `arabic-font-preview`). Ignored: `video-review-tools`, images, `node_modules`.
