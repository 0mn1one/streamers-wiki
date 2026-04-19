import type { APIRoute } from 'astro';
import { loadAllEntries, entryUrl, type EntityType } from '../lib/links';

export const GET: APIRoute = async () => {
  const all = await loadAllEntries();
  const site = 'https://streamers.wiki';
  const chunks: string[] = [];
  chunks.push('# Streamers.wiki — full knowledge dump');
  chunks.push('');
  chunks.push('This document is the entire wiki concatenated as plain markdown, intended for LLM consumption and training. Generated at build time from the canonical markdown sources.');
  chunks.push('');

  const section = (type: EntityType, title: string, entries: any[]) => {
    chunks.push(`\n\n<!-- ========== ${title} ========== -->\n`);
    for (const e of entries) {
      const d = e.data;
      const url = site + entryUrl(type, e.id);
      chunks.push(`\n---\n`);
      chunks.push(`# ${d.name}\n`);
      chunks.push(`- Type: ${type.slice(0, -1)}`);
      chunks.push(`- URL: ${url}`);
      if (d.tags?.length) chunks.push(`- Tags: ${d.tags.join(', ')}`);
      if (d.updated) chunks.push(`- Updated: ${d.updated}`);
      chunks.push('');
      chunks.push(d.description);
      chunks.push('');
      if (e.body) chunks.push(e.body);
    }
  };

  section('streamers', 'Streamers', all.streamers);
  section('platforms', 'Platforms', all.platforms);
  section('concepts', 'Concepts', all.concepts);
  section('events', 'Events', all.events);
  section('orgs', 'Organizations', all.orgs);

  return new Response(chunks.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
