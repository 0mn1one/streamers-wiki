import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { entryUrl } from '../../lib/links';

export async function getStaticPaths() {
  const entries = await getCollection('concepts');
  return entries.map((e) => ({ params: { slug: e.id }, props: { entry: e } }));
}

export const GET: APIRoute = ({ props }) => {
  const entry = (props as any).entry;
  const d = entry.data;
  const url = new URL(entryUrl('concepts', entry.id), 'https://streamers.wiki').toString();
  const fm = `---\ntitle: ${d.name}\ntype: concept\ncategory: ${d.category}\nurl: ${url}\n---\n\n`;
  return new Response(fm + `# ${d.name}\n\n${d.description}\n\n` + (entry.body ?? ''), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
};
