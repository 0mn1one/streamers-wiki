import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const linkList = z.array(z.string()).default([]);

const streamers = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/streamers' }),
  schema: z.object({
    name: z.string(),
    real_name: z.string().optional(),
    aliases: z.array(z.string()).default([]),
    born: z.string().optional(),
    nationality: z.string().optional(),
    primary_platform: z.string().optional(),
    platforms: linkList,
    orgs: linkList,
    genres: z.array(z.string()).default([]),
    started: z.string().optional(),
    followers: z.number().optional(),
    subs_peak: z.number().optional(),
    verified: z.boolean().default(false),
    active: z.boolean().default(true),
    handles: z.record(z.string(), z.string()).default({}),
    related: linkList,
    tags: z.array(z.string()).default([]),
    description: z.string(),
    sources: z.array(z.string()).default([]),
    updated: z.string().optional(),
    clips: z.array(z.object({
      platform: z.enum(['twitch', 'youtube']),
      id: z.string(),
      title: z.string().optional(),
    })).default([]),
    faq: z.array(z.object({
      q: z.string(),
      a: z.string(),
    })).default([]),
    timeline: z.array(z.object({
      date: z.string(),
      label: z.string(),
      note: z.string().optional(),
      kind: z.enum(['start', 'platform', 'deal', 'ban', 'record', 'event', 'business', 'other']).default('other'),
      ref: z.string().optional(),
    })).default([]),
    records: z.array(z.object({
      label: z.string(),
      value: z.union([z.string(), z.number()]).transform((v) => String(v)),
      context: z.string().optional(),
      date: z.string().optional(),
    })).default([]),
    quotes: z.array(z.object({
      text: z.string(),
      source: z.string().optional(),
      date: z.string().optional(),
    })).default([]),
    controversies: z.array(z.object({
      date: z.string(),
      title: z.string(),
      summary: z.string(),
      outcome: z.string().optional(),
      ref: z.string().optional(),
    })).default([]),
  }),
});

const platforms = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/platforms' }),
  schema: z.object({
    name: z.string(),
    founded: z.string().optional(),
    founders: z.array(z.string()).default([]),
    owner: z.string().optional(),
    hq: z.string().optional(),
    url: z.string().url().optional(),
    revenue_split: z.string().optional(),
    monthly_active: z.number().optional(),
    tags: z.array(z.string()).default([]),
    related: linkList,
    description: z.string(),
    sources: z.array(z.string()).default([]),
    updated: z.string().optional(),
  }),
});

const concepts = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/concepts' }),
  schema: z.object({
    name: z.string(),
    category: z.enum(['meta', 'culture', 'tech', 'monetization', 'policy', 'drama', 'term']).default('term'),
    tags: z.array(z.string()).default([]),
    related: linkList,
    description: z.string(),
    sources: z.array(z.string()).default([]),
    updated: z.string().optional(),
  }),
});

const events = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/events' }),
  schema: z.object({
    name: z.string(),
    date: z.string(),
    end_date: z.string().optional(),
    type: z.enum(['tournament', 'drama', 'ban', 'launch', 'acquisition', 'irl', 'boxing', 'subathon', 'other']).default('other'),
    participants: linkList,
    platforms: linkList,
    tags: z.array(z.string()).default([]),
    related: linkList,
    description: z.string(),
    sources: z.array(z.string()).default([]),
    updated: z.string().optional(),
  }),
});

const orgs = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/orgs' }),
  schema: z.object({
    name: z.string(),
    founded: z.string().optional(),
    founders: z.array(z.string()).default([]),
    hq: z.string().optional(),
    type: z.enum(['collective', 'agency', 'tournament', 'label', 'company', 'house']).default('collective'),
    members: linkList,
    url: z.string().url().optional(),
    tags: z.array(z.string()).default([]),
    related: linkList,
    description: z.string(),
    sources: z.array(z.string()).default([]),
    updated: z.string().optional(),
  }),
});

export const collections = { streamers, platforms, concepts, events, orgs };
