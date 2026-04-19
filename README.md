# streamers.wiki

An open, LLM-friendly wiki for streamers, streaming platforms, creators, and streaming culture. Part of [0mn1.one](https://0mn1.one).

## Stack

- **Astro 6** — static site generator with content collections
- **Markdown + YAML frontmatter** — the canonical content format
- **Cytoscape.js** — Obsidian-style graph view
- **Fuse.js** — client-side fuzzy search
- **Cloudflare Pages** — deployment target (fully static output)

## Develop

```bash
npm install
npm run dev
```

Open <http://localhost:4321>.

## Build

```bash
npm run build
```

Outputs to `dist/`. Deploy to Cloudflare Pages by pointing the project at this repo (build command `npm run build`, output `dist`), or push directly:

```bash
npm run deploy
```

## Adding content

Every entity is a single markdown file with YAML frontmatter. See [`CLAUDE.md`](./CLAUDE.md) for the full schema and editorial guidelines.

## LLM surfaces

- `/llms.txt` — site index per the [llms.txt](https://llmstxt.org/) proposal
- `/llms-full.txt` — full knowledge dump as concatenated markdown
- `<page>.md` — every page has a plain-markdown twin (append `.md` to any entry URL)
- `/api/graph.json` — full entity/edge graph as JSON
- JSON-LD on every page

## License

- Content: [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)
- Code: MIT
