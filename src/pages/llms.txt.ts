import type { APIRoute } from 'astro';
import { loadAllEntries, entryUrl } from '../lib/links';

export const GET: APIRoute = async () => {
  const all = await loadAllEntries();
  const site = 'https://streamers.wiki';
  const lines: string[] = [];
  lines.push('# Streamers.wiki');
  lines.push('');
  lines.push('> An open, LLM-friendly wiki covering streamers, streaming platforms, creators, culture, and the business around live streaming. Every page has a plain-markdown twin at `<page-url>.md`.');
  lines.push('');
  lines.push('This file follows the llms.txt proposal (https://llmstxt.org/). A full, concatenated knowledge dump is at /llms-full.txt.');
  lines.push('');
  lines.push('## Meta');
  lines.push(`- [About](${site}/about/): Project mission, editorial standards, license (CC BY-SA 4.0)`);
  lines.push(`- [Contribute](${site}/contribute/): How to add entries, schema, conventions`);
  lines.push(`- [Graph](${site}/graph/): Interactive graph of every entity and relationship`);
  lines.push(`- [Sitemap](${site}/sitemap-index.xml)`);
  lines.push(`- [RSS](${site}/rss.xml)`);
  lines.push('');

  const section = (title: string, entries: any[], type: Parameters<typeof entryUrl>[0]) => {
    if (!entries.length) return;
    lines.push(`## ${title}`);
    for (const e of entries) {
      const u = (site + entryUrl(type, e.id)).replace(/\/$/, '');
      lines.push(`- [${e.data.name}](${u}.md): ${e.data.description}`);
    }
    lines.push('');
  };

  section('Streamers', all.streamers, 'streamers');
  section('Platforms', all.platforms, 'platforms');
  section('Concepts', all.concepts, 'concepts');
  section('Events', all.events, 'events');
  section('Organizations', all.orgs, 'orgs');

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
