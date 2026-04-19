// Rehype plugin that auto-links prose mentions of known wiki entities.
// Builds an index once from the frontmatter of every .md file under
// src/content/, then on each rendered document it walks text nodes and
// replaces the first occurrence of each known entity name or alias
// with an <a> pointing to that entity's page.
//
// Rules:
//   - Only links the first occurrence of each entity per document.
//   - Does not self-link (the page's own entity is skipped).
//   - Does not link inside <a>, <code>, <pre>, or <h1/2/3>.
//   - Matches are word-boundary anchored.
//   - Longer names are tried before shorter ones so that "Kai Cenat"
//     wins over a nested "Kai".

import { visit, SKIP } from 'unist-util-visit';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const TYPES = {
  streamers: 'streamer',
  platforms: 'platform',
  concepts: 'concept',
  events: 'event',
  orgs: 'org',
};

// Simple YAML frontmatter extraction for name/aliases/real_name/id.
function parseFrontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return null;
  const out = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (!kv) continue;
    const key = kv[1];
    let val = kv[2].trim();
    if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    if (val.startsWith('[') && val.endsWith(']')) {
      try {
        val = JSON.parse(val.replace(/'/g, '"'));
      } catch {
        val = [];
      }
    }
    out[key] = val;
  }
  return out;
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function loadIndex(root) {
  const CONTENT = join(root, 'src/content');
  const entries = [];
  for (const [dir, routeKey] of Object.entries(TYPES)) {
    const full = join(CONTENT, dir);
    let files;
    try {
      files = readdirSync(full).filter((f) => f.endsWith('.md') || f.endsWith('.mdx'));
    } catch {
      continue;
    }
    for (const file of files) {
      const slug = file.replace(/\.(md|mdx)$/, '');
      const fm = parseFrontmatter(readFileSync(join(full, file), 'utf8'));
      if (!fm?.name) continue;
      const url = `/${routeKey}/${slug}/`;
      const names = new Set([fm.name]);
      if (Array.isArray(fm.aliases)) for (const a of fm.aliases) names.add(a);
      if (fm.real_name) names.add(fm.real_name);
      for (const n of names) {
        if (!n || n.length < 3) continue; // avoid 1-2 char matches
        // Skip trivially common English words that happen to be names
        if (/^(the|and|for|with|out|kick|now|new)$/i.test(n)) continue;
        entries.push({
          name: n,
          slug,
          type: dir,
          url,
          // Pattern: word-boundary before, match literal (case-insensitive),
          // word-boundary or punctuation after.
          pattern: new RegExp(`(^|[^\\w])(${escapeRegex(n)})(?=[^\\w]|$)`, 'i'),
        });
      }
    }
  }
  // Longest first so multi-word names win
  entries.sort((a, b) => b.name.length - a.name.length);
  return entries;
}

const SKIP_TAGS = new Set(['a', 'code', 'pre', 'kbd', 'h1', 'h2', 'h3', 'script', 'style']);

function selfUrlFromVfile(file) {
  const p = file?.path ?? file?.history?.[0] ?? '';
  const m = p.match(/src\/content\/(streamers|platforms|concepts|events|orgs)\/([^/]+)\.(md|mdx)$/);
  if (!m) return null;
  const routeKey = TYPES[m[1]];
  return `/${routeKey}/${m[2]}/`;
}

let cachedIndex = null;
function getIndex() {
  if (cachedIndex) return cachedIndex;
  cachedIndex = loadIndex(process.cwd());
  return cachedIndex;
}

export default function rehypeWikiLinks() {
  const index = getIndex();

  return (tree, file) => {
    const self = selfUrlFromVfile(file);
    const linked = new Set();

    const inSkipped = (ancestors) => ancestors.some((a) => a.tagName && SKIP_TAGS.has(a.tagName));

    function walk(node, ancestors) {
      if (node.type === 'element') {
        if (SKIP_TAGS.has(node.tagName)) return;
        const newAncestors = [...ancestors, node];
        for (let i = 0; i < node.children.length; i++) {
          const child = node.children[i];
          const consumed = walk(child, newAncestors);
          if (consumed > 0) {
            i += consumed; // skip inserted nodes
          }
        }
        return 0;
      }

      if (node.type !== 'text') return 0;
      if (inSkipped(ancestors)) return 0;
      const parent = ancestors[ancestors.length - 1];
      if (!parent) return 0;

      // Try each entity; first match in this text node wins.
      for (const entry of index) {
        if (linked.has(entry.slug + ':' + entry.type)) continue;
        if (entry.url === self) continue;
        const m = node.value.match(entry.pattern);
        if (!m || m.index === undefined) continue;

        const leading = m[1] ?? '';
        const matchStart = m.index + leading.length;
        const matched = m[2];
        const before = node.value.slice(0, matchStart);
        const after = node.value.slice(matchStart + matched.length);

        const idx = parent.children.indexOf(node);
        if (idx === -1) return 0;

        const replacements = [];
        if (before) replacements.push({ type: 'text', value: before });
        replacements.push({
          type: 'element',
          tagName: 'a',
          properties: {
            href: entry.url,
            className: ['wikilink'],
            'data-wiki-type': entry.type,
          },
          children: [{ type: 'text', value: matched }],
        });
        if (after) replacements.push({ type: 'text', value: after });
        parent.children.splice(idx, 1, ...replacements);
        linked.add(entry.slug + ':' + entry.type);
        return replacements.length - 1;
      }
      return 0;
    }

    if (tree.type === 'root') {
      for (let i = 0; i < tree.children.length; i++) {
        walk(tree.children[i], [tree]);
      }
    }
  };
}
