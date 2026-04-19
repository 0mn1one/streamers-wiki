import type { APIRoute } from 'astro';
import { renderOgPng } from '../lib/og';

export const GET: APIRoute = async () => {
  const png = await renderOgPng({
    type: 'streamers',
    name: 'Streamers.wiki',
    description: 'The open, LLM-friendly wiki for streamers, streaming platforms and streaming culture.',
    meta: 'Rooted in life',
  });
  return new Response(new Uint8Array(png), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
