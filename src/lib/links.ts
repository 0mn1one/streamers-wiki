import { getCollection, type CollectionEntry } from 'astro:content';

export type EntityType = 'streamers' | 'platforms' | 'concepts' | 'events' | 'orgs';

export const ENTITY_ROUTES: Record<EntityType, string> = {
  streamers: 'streamer',
  platforms: 'platform',
  concepts: 'concept',
  events: 'event',
  orgs: 'org',
};

export const ENTITY_COLOR: Record<EntityType, string> = {
  streamers: '#8b5cf6',
  platforms: '#22d3ee',
  concepts: '#f59e0b',
  events: '#ef4444',
  orgs: '#10b981',
};

export interface WikiNode {
  id: string;
  slug: string;
  type: EntityType;
  name: string;
  description: string;
  url: string;
  tags: string[];
  degree?: number;
}

export interface WikiEdge {
  source: string;
  target: string;
  kind: string;
}

type AnyEntry =
  | CollectionEntry<'streamers'>
  | CollectionEntry<'platforms'>
  | CollectionEntry<'concepts'>
  | CollectionEntry<'events'>
  | CollectionEntry<'orgs'>;

export function entryUrl(type: EntityType, slug: string) {
  return `/${ENTITY_ROUTES[type]}/${slug}/`;
}

export function entryId(type: EntityType, slug: string) {
  return `${type}:${slug}`;
}

function parseRef(ref: string): { type: EntityType; slug: string } | null {
  if (!ref) return null;
  const trimmed = ref.trim();
  if (trimmed.includes(':')) {
    const [type, slug] = trimmed.split(':');
    if (type in ENTITY_ROUTES) return { type: type as EntityType, slug: slug.trim() };
  }
  return null;
}

export async function loadAllEntries() {
  const [streamers, platforms, concepts, events, orgs] = await Promise.all([
    getCollection('streamers'),
    getCollection('platforms'),
    getCollection('concepts'),
    getCollection('events'),
    getCollection('orgs'),
  ]);
  return { streamers, platforms, concepts, events, orgs };
}

export async function buildGraph() {
  const all = await loadAllEntries();
  const nodes: WikiNode[] = [];
  const edges: WikiEdge[] = [];
  const seen = new Set<string>();

  const addNode = (type: EntityType, slug: string, name: string, description: string, tags: string[] = []) => {
    const id = entryId(type, slug);
    if (seen.has(id)) return;
    seen.add(id);
    nodes.push({ id, slug, type, name, description, url: entryUrl(type, slug), tags });
  };

  const addEdge = (a: string, b: string, kind: string) => {
    if (!seen.has(a) || !seen.has(b) || a === b) return;
    edges.push({ source: a, target: b, kind });
  };

  for (const entry of all.streamers) {
    addNode('streamers', entry.id, entry.data.name, entry.data.description, entry.data.tags);
  }
  for (const entry of all.platforms) {
    addNode('platforms', entry.id, entry.data.name, entry.data.description, entry.data.tags);
  }
  for (const entry of all.concepts) {
    addNode('concepts', entry.id, entry.data.name, entry.data.description, entry.data.tags);
  }
  for (const entry of all.events) {
    addNode('events', entry.id, entry.data.name, entry.data.description, entry.data.tags);
  }
  for (const entry of all.orgs) {
    addNode('orgs', entry.id, entry.data.name, entry.data.description, entry.data.tags);
  }

  const linkFrom = (from: string, refs: string[] | undefined, kind: string) => {
    if (!refs) return;
    for (const raw of refs) {
      const parsed = parseRef(raw);
      if (!parsed) continue;
      addEdge(from, entryId(parsed.type, parsed.slug), kind);
    }
  };

  for (const e of all.streamers) {
    const id = entryId('streamers', e.id);
    linkFrom(id, e.data.platforms, 'platform');
    linkFrom(id, e.data.orgs, 'org');
    linkFrom(id, e.data.related, 'related');
  }
  for (const e of all.platforms) {
    const id = entryId('platforms', e.id);
    linkFrom(id, e.data.related, 'related');
  }
  for (const e of all.concepts) {
    const id = entryId('concepts', e.id);
    linkFrom(id, e.data.related, 'related');
  }
  for (const e of all.events) {
    const id = entryId('events', e.id);
    linkFrom(id, e.data.participants, 'participant');
    linkFrom(id, e.data.platforms, 'platform');
    linkFrom(id, e.data.related, 'related');
  }
  for (const e of all.orgs) {
    const id = entryId('orgs', e.id);
    linkFrom(id, e.data.members, 'member');
    linkFrom(id, e.data.related, 'related');
  }

  const degree = new Map<string, number>();
  for (const edge of edges) {
    degree.set(edge.source, (degree.get(edge.source) ?? 0) + 1);
    degree.set(edge.target, (degree.get(edge.target) ?? 0) + 1);
  }
  for (const node of nodes) node.degree = degree.get(node.id) ?? 0;

  return { nodes, edges };
}

export async function getBacklinks(type: EntityType, slug: string) {
  const { edges, nodes } = await buildGraph();
  const target = entryId(type, slug);
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const out: { node: WikiNode; kind: string; direction: 'in' | 'out' }[] = [];
  for (const edge of edges) {
    if (edge.target === target) {
      const n = byId.get(edge.source);
      if (n) out.push({ node: n, kind: edge.kind, direction: 'in' });
    } else if (edge.source === target) {
      const n = byId.get(edge.target);
      if (n) out.push({ node: n, kind: edge.kind, direction: 'out' });
    }
  }
  const seen = new Set<string>();
  return out.filter((x) => {
    const k = x.node.id + x.direction;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

export function resolveRef(ref: string) {
  const parsed = parseRef(ref);
  if (!parsed) return null;
  return { ...parsed, url: entryUrl(parsed.type, parsed.slug) };
}
