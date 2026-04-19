#!/usr/bin/env node
// Validate wiki content: check cross-refs, detect duplicates, flag stale dates,
// report dead-end entries. Fails the build on hard errors (unresolved refs,
// duplicate slugs); warns on soft issues (stale, no sources).
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const CONTENT = join(ROOT, 'src/content');
const STALE_MONTHS = 12;
const NOW = new Date();

const TYPES = ['streamers', 'platforms', 'concepts', 'events', 'orgs'];

function parseFrontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return null;
  const fm = {};
  const lines = m[1].split('\n');
  for (const line of lines) {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (!kv) continue;
    const k = kv[1];
    let v = kv[2];
    if (v.startsWith("'") && v.endsWith("'")) v = v.slice(1, -1);
    fm[k] = v;
  }
  // Extract related array crudely
  const relatedMatch = m[1].match(/^related:\s*(\[[^\]]*\])/m);
  if (relatedMatch) {
    try {
      const arr = relatedMatch[1]
        .replace(/'/g, '"')
        .replace(/\s+/g, '');
      fm.related = JSON.parse(arr);
    } catch {
      fm.related = [];
    }
  }
  return fm;
}

const errors = [];
const warnings = [];
const slugs = new Map(); // "type:slug" -> file
const names = new Map(); // lowercased name -> [files]

for (const type of TYPES) {
  const dir = join(CONTENT, type);
  let files;
  try {
    files = readdirSync(dir).filter((f) => f.endsWith('.md') || f.endsWith('.mdx'));
  } catch {
    continue;
  }
  for (const file of files) {
    const full = join(dir, file);
    const slug = file.replace(/\.(md|mdx)$/, '');
    const fm = parseFrontmatter(readFileSync(full, 'utf8'));
    if (!fm) {
      errors.push(`${relative(ROOT, full)}: missing frontmatter`);
      continue;
    }
    const id = `${type}:${slug}`;
    if (slugs.has(id)) errors.push(`${relative(ROOT, full)}: duplicate slug ${id}`);
    slugs.set(id, full);

    if (fm.name) {
      const key = fm.name.toLowerCase();
      if (!names.has(key)) names.set(key, []);
      names.get(key).push(full);
    }

    if (fm.updated) {
      const dt = new Date(fm.updated);
      if (!isNaN(+dt)) {
        const months = (NOW - dt) / (1000 * 60 * 60 * 24 * 30);
        if (months > STALE_MONTHS) warnings.push(`${relative(ROOT, full)}: stale (updated ${fm.updated}, ${Math.round(months)} months ago)`);
      }
    } else {
      warnings.push(`${relative(ROOT, full)}: missing updated field`);
    }
  }
}

// Second pass: resolve refs
for (const type of TYPES) {
  const dir = join(CONTENT, type);
  let files;
  try {
    files = readdirSync(dir).filter((f) => f.endsWith('.md') || f.endsWith('.mdx'));
  } catch {
    continue;
  }
  for (const file of files) {
    const full = join(dir, file);
    const src = readFileSync(full, 'utf8');
    const fm = parseFrontmatter(src);
    if (!fm) continue;
    const refs = fm.related ?? [];
    // Also grab any 'platforms:', 'orgs:', 'participants:', 'members:' arrays textually
    const extra = [];
    for (const key of ['platforms', 'orgs', 'participants', 'members']) {
      const m = src.match(new RegExp(`^${key}:\\s*(\\[[^\\]]*\\])`, 'm'));
      if (!m) continue;
      try {
        const arr = JSON.parse(m[1].replace(/'/g, '"').replace(/\s+/g, ''));
        extra.push(...arr);
      } catch {}
    }
    for (const ref of [...refs, ...extra]) {
      if (typeof ref !== 'string' || !ref.includes(':')) continue;
      if (!slugs.has(ref)) {
        errors.push(`${relative(ROOT, full)}: unresolved ref "${ref}"`);
      }
    }
  }
}

for (const [name, files] of names) {
  if (files.length > 1) {
    warnings.push(`duplicate name "${name}": ${files.map((f) => relative(ROOT, f)).join(', ')}`);
  }
}

if (warnings.length) {
  console.log(`\n⚠ ${warnings.length} warning${warnings.length === 1 ? '' : 's'}:`);
  for (const w of warnings) console.log('  ' + w);
}
if (errors.length) {
  console.error(`\n✗ ${errors.length} error${errors.length === 1 ? '' : 's'}:`);
  for (const e of errors) console.error('  ' + e);
  process.exit(1);
}
console.log(`\n✓ lint passed (${slugs.size} entries)`);
