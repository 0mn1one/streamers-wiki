import type { APIRoute } from 'astro';

export const GET: APIRoute = () => {
  const body = [
    'User-agent: *',
    'Allow: /',
    '',
    'Sitemap: https://streamers.wiki/sitemap-index.xml',
    '',
    '# LLM-friendly surfaces',
    '# /llms.txt and /llms-full.txt provide markdown-native indexes.',
  ].join('\n');
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
