import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { entryUrl } from '../../lib/links';

export async function getStaticPaths() {
  const entries = await getCollection('streamers');
  return entries.map((e) => ({ params: { slug: e.id }, props: { entry: e } }));
}

export const GET: APIRoute = ({ props }) => {
  const entry = (props as any).entry;
  const d = entry.data;
  const url = new URL(entryUrl('streamers', entry.id), 'https://streamers.wiki').toString();
  const fm = `---\ntitle: ${d.name}\ntype: streamer\nurl: ${url}\n---\n\n`;
  const header = `# ${d.name}\n\n${d.description}\n\n`;
  const meta = [
    d.real_name && `- Real name: ${d.real_name}`,
    d.primary_platform && `- Primary platform: ${d.primary_platform}`,
    d.platforms?.length && `- Platforms: ${d.platforms.join(', ')}`,
    d.orgs?.length && `- Orgs: ${d.orgs.join(', ')}`,
    d.started && `- Started: ${d.started}`,
    d.followers && `- Followers: ${d.followers.toLocaleString()}+`,
    d.tags?.length && `- Tags: ${d.tags.join(', ')}`,
  ].filter(Boolean).join('\n');
  const body = entry.body ?? '';
  return new Response(fm + header + meta + '\n\n' + body, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
};
