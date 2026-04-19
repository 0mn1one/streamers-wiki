import type { APIRoute } from 'astro';
import { loadAllEntries, type EntityType } from '../../../lib/links';
import { renderOgPng } from '../../../lib/og';

export async function getStaticPaths() {
  const all = await loadAllEntries();
  const out: { params: { type: EntityType; slug: string }; props: any }[] = [];
  const push = (type: EntityType, entries: any[], metaFn: (d: any) => string | undefined) => {
    for (const e of entries) {
      out.push({
        params: { type, slug: e.id },
        props: { type, name: e.data.name, description: e.data.description, meta: metaFn(e.data) },
      });
    }
  };
  push('streamers', all.streamers, (d) => {
    const parts: string[] = [];
    if (d.primary_platform) parts.push(d.primary_platform);
    if (d.followers) parts.push(`${Math.round(d.followers / 100000) / 10}M followers`);
    return parts.join(' · ') || undefined;
  });
  push('platforms', all.platforms, (d) => d.founded ? `Founded ${d.founded}` : undefined);
  push('concepts', all.concepts, (d) => d.category);
  push('events', all.events, (d) => d.date);
  push('orgs', all.orgs, (d) => d.type);
  return out;
}

export const GET: APIRoute = async ({ props }) => {
  const { type, name, description, meta } = props as any;
  const png = await renderOgPng({ type, name, description, meta });
  return new Response(new Uint8Array(png), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
