import type { APIRoute } from 'astro';
import { buildGraph } from '../../lib/links';

export const GET: APIRoute = async () => {
  const graph = await buildGraph();
  return new Response(JSON.stringify(graph), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
