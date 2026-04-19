import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { loadAllEntries, entryUrl, type EntityType } from '../lib/links';

export const GET: APIRoute = async (context) => {
  const all = await loadAllEntries();
  const items: { type: EntityType; slug: string; name: string; description: string; updated?: string }[] = [];
  const push = (type: EntityType, arr: any[]) =>
    arr.forEach((e) => items.push({ type, slug: e.id, name: e.data.name, description: e.data.description, updated: e.data.updated }));
  push('streamers', all.streamers);
  push('platforms', all.platforms);
  push('concepts', all.concepts);
  push('events', all.events);
  push('orgs', all.orgs);
  items.sort((a, b) => (b.updated ?? '').localeCompare(a.updated ?? ''));

  return rss({
    title: 'Streamers.wiki',
    description: 'The open, LLM-friendly wiki for streamers, streaming platforms and streaming culture.',
    site: context.site ?? 'https://streamers.wiki',
    items: items.slice(0, 100).map((i) => ({
      title: i.name,
      link: entryUrl(i.type, i.slug),
      description: i.description,
      pubDate: i.updated ? new Date(i.updated) : new Date(),
    })),
  });
};
