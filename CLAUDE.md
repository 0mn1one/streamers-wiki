# CLAUDE.md — Streamers.wiki

This file is the editorial and structural schema for Streamers.wiki, following the [Karpathy LLM-wiki pattern](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f). Any LLM editing this repository should read this file before making changes.

## Mission

Streamers.wiki is a community wiki for streamers, streaming platforms, creators, and streaming culture. It is designed to be:

1. **Read by humans** — clear, concise, encyclopedic prose.
2. **Understood by machines** — plain markdown, explicit cross-links, frontmatter everywhere, JSON-LD on every page, `/llms.txt` and per-page `.md` twins.
3. **Durable** — every claim sourced, every entity cross-linked, editorial tone neutral.

The site is part of [0mn1.one](https://0mn1.one). Revenue from this project funds 0mn1's broader mission of worldwide abundance.

## Architecture

```
src/
  content/
    streamers/   # one .md per streamer
    platforms/   # one .md per streaming platform
    concepts/    # one .md per term, meta, mechanic, cultural idea
    events/      # one .md per discrete moment (ban, tournament, deal, subathon)
    orgs/        # one .md per collective, agency, tournament org, creator house
  content.config.ts   # Zod schemas for each collection — source of truth
  lib/links.ts        # graph builder, link resolver, backlinks
  layouts/, components/, pages/   # Astro site
CLAUDE.md           # this file — schema and editorial guidelines
```

Every content file has YAML frontmatter validated against `src/content.config.ts`. The schema there is authoritative; this file explains the intent.

## Entity types

### streamers

A person who streams. File: `src/content/streamers/<slug>.md`.

Required frontmatter: `name`, `description`. Strongly recommended: `primary_platform`, `platforms`, `started`, `followers`, `active`, `tags`, `updated`.

Example minimal:

```markdown
---
name: Example Streamer
aliases: ['example']
primary_platform: Twitch
platforms: ['platforms:twitch']
genres: ['Just Chatting']
started: '2020'
followers: 500000
active: true
tags: ['variety', 'english']
description: One-line neutral summary.
related: ['concepts:subathon']
sources: []
updated: 2026-04-18
---
```

### platforms

A live-streaming service (Twitch, Kick, YouTube Live, TikTok Live, Rumble, etc.).

### concepts

A term, meta, monetization mechanic, policy, cultural idea, or piece of slang. `category` must be one of: `meta`, `culture`, `tech`, `monetization`, `policy`, `drama`, `term`.

### events

A discrete moment in streaming history. `type` must be one of: `tournament`, `drama`, `ban`, `launch`, `acquisition`, `irl`, `boxing`, `subathon`, `other`.

### orgs

A creator collective, agency, tournament organizer, or content house. `type` must be one of: `collective`, `agency`, `tournament`, `label`, `company`, `house`.

## Cross-linking (the most important part)

All cross-references in frontmatter use the form `type:slug`. Examples:

- `streamers:xqc`
- `platforms:twitch`
- `concepts:subathon`
- `events:ludwig-subathon-2021`
- `orgs:otk`

These power the infobox, the backlinks section, and the `/graph/` view. Invalid refs are silently skipped — so keep slugs accurate. When adding a new entity, update the `related` field of entities it naturally connects to.

In-body prose can also use normal markdown links; the graph is built from frontmatter only.

## Editorial tone

- **Neutral point of view.** Describe what happened, how parties responded, what claims were made. Do not declare winners. Do not adopt creator or platform framing.
- **Encyclopedic, not journalistic.** Third person, past tense for events, present tense for ongoing state.
- **Source anything that isn't obviously true.** Primary sources (platform policy posts, Wikipedia, first-hand statements) are preferred. Prefer permanent URLs over live pages when possible.
- **Drama pages document, they don't adjudicate.** Present what was said and done, not whether it was right.
- **Brevity first, then depth.** The `description` field should stand alone as a one-sentence summary for a reader who never clicks through.
- **No marketing language.** If a streamer "is famous for" something, say what they did and let the reader decide.

## Ops

Three operations, following Karpathy:

1. **Ingest** — when new sources surface (interviews, statements, coverage, platform policy changes), create or update the relevant entity files.
2. **Query** — humans and LLMs query the site via the UI, the graph, `/llms.txt`, `/llms-full.txt`, or per-page `.md` twins.
3. **Lint** — before committing, verify: frontmatter validates, cross-references resolve, no duplicates, dates are absolute (never "last year"), `updated` field is current.

## When adding a streamer

1. Check `src/content/streamers/` — slug collisions are silent failures.
2. Fill the frontmatter fully. Omit fields you don't know rather than guessing.
3. At minimum, link `platforms` in frontmatter.
4. Body should cover: career, notable moments, platform history, controversies (if any), business (if any).
5. Add a one-line `description` that stands on its own.
6. Add at least one `source` URL.
7. Update `related` on connected entities if you introduce a notable link (e.g. add this streamer to a relevant org's `members`).

## When adding an event

1. Always an absolute ISO date.
2. List all major `participants` and `platforms`.
3. Link related concepts (subathon events link `concepts:subathon`, bans link `concepts:tos-strike`).
4. Describe what happened, in chronological order, without editorializing.

## When adding a concept

1. Pick the narrowest accurate `category`.
2. Start the body with a bolded term and a one-sentence definition that could fit in a dictionary.
3. Include a "History" section for anything with a specific origin.

## Build and deploy

- `npm run dev` — local dev server.
- `npm run build` — static build to `dist/`.
- `npm run deploy` — push to Cloudflare Pages via wrangler.
- The build is fully static — no server, no database, no runtime rendering. Perfect for Cloudflare Pages.

## Non-negotiables

- Every page has a `.md` twin.
- Every page has JSON-LD.
- Every streamer, platform, concept, event, org is listed in `/llms.txt`.
- Every commit that meaningfully changes a page updates its `updated:` date.
- Content is licensed CC BY-SA 4.0; code MIT.
