#!/usr/bin/env node
// One-shot seeder: injects typed-relationship frontmatter fields into a
// set of streamer files without disturbing the rest of the frontmatter.
// Invoked manually, not part of the build.

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const DIR = join(ROOT, 'src/content/streamers');

/** map of slug -> { field: arrayOfRefs } */
const seeds = {
  'kai-cenat': {
    influenced_by: ['streamers:ludwig', 'streamers:xqc'],
    collaborators: ['streamers:fanum', 'streamers:duke-dennis', 'streamers:agent-00', 'streamers:stable-ronaldo'],
    successors: ['streamers:plaqueboymax', 'streamers:caseoh'],
  },
  'xqc': {
    influenced: ['streamers:kai-cenat'],
    collaborators: ['streamers:trainwreckstv'],
    rivals: ['streamers:destiny'],
  },
  'ludwig': {
    influenced: ['streamers:kai-cenat', 'streamers:ironmouse'],
    collaborators: ['streamers:qtcinderella'],
  },
  'ninja': {
    influenced: ['streamers:tfue', 'streamers:myth', 'streamers:clix'],
    successors: ['streamers:xqc', 'streamers:kai-cenat'],
  },
  'pokimane': {
    collaborators: ['streamers:valkyrae', 'streamers:disguised-toast', 'streamers:lilypichu', 'streamers:scarra', 'streamers:sykkuno'],
  },
  'ksi': {
    rivals: ['streamers:logan-paul'],
    collaborators: ['streamers:miniminter', 'streamers:vikkstar', 'streamers:w2s'],
    successors: ['streamers:ishowspeed'],
  },
  'logan-paul': {
    rivals: ['streamers:ksi'],
  },
  'ishowspeed': {
    influenced_by: ['streamers:ksi'],
    collaborators: ['streamers:ksi', 'streamers:miniminter'],
  },
  'hasanabi': {
    rivals: ['streamers:destiny'],
  },
  'destiny': {
    rivals: ['streamers:hasanabi', 'streamers:xqc'],
  },
  'valkyrae': {
    collaborators: ['streamers:pokimane', 'streamers:disguised-toast', 'streamers:sykkuno', 'streamers:corpse-husband'],
  },
  'sykkuno': {
    collaborators: ['streamers:valkyrae', 'streamers:disguised-toast', 'streamers:pokimane'],
  },
  'disguised-toast': {
    collaborators: ['streamers:valkyrae', 'streamers:pokimane', 'streamers:sykkuno', 'streamers:lilypichu'],
  },
  'fanum': {
    collaborators: ['streamers:kai-cenat', 'streamers:duke-dennis', 'streamers:agent-00'],
  },
  'duke-dennis': {
    collaborators: ['streamers:kai-cenat', 'streamers:fanum', 'streamers:agent-00'],
  },
  'miniminter': {
    collaborators: ['streamers:ksi', 'streamers:vikkstar', 'streamers:w2s', 'streamers:tbjzl', 'streamers:behzinga', 'streamers:zerkaa'],
  },
  'shroud': {
    collaborators: ['streamers:ninja'],
  },
  'gmhikaru': {
    collaborators: ['streamers:botezlive'],
  },
  'botezlive': {
    collaborators: ['streamers:gmhikaru'],
  },
  'trainwreckstv': {
    collaborators: ['streamers:xqc'],
  },
  'ibai': {
    collaborators: ['streamers:auronplay', 'streamers:rubius', 'streamers:thegrefg', 'streamers:elxokas', 'streamers:illojuan'],
  },
  'auronplay': {
    collaborators: ['streamers:ibai', 'streamers:rubius'],
  },
  'rubius': {
    collaborators: ['streamers:ibai', 'streamers:auronplay'],
  },
  'thegrefg': {
    collaborators: ['streamers:ibai'],
  },
  'gawr-gura': {
    collaborators: ['streamers:mori-calliope', 'streamers:takanashi-kiara'],
  },
  'mori-calliope': {
    collaborators: ['streamers:gawr-gura', 'streamers:takanashi-kiara'],
  },
  'takanashi-kiara': {
    collaborators: ['streamers:gawr-gura', 'streamers:mori-calliope'],
  },
  'ironmouse': {
    influenced_by: ['streamers:ludwig'],
  },
  'mizkif': {
    collaborators: ['streamers:asmongold', 'streamers:sodapoppin', 'streamers:emiru'],
  },
  'asmongold': {
    collaborators: ['streamers:mizkif', 'streamers:sodapoppin', 'streamers:lacari'],
  },
};

const TYPED_KEYS = ['influenced_by', 'influenced', 'collaborators', 'rivals', 'successors'];

let changed = 0;
for (const [slug, fields] of Object.entries(seeds)) {
  const path = join(DIR, `${slug}.md`);
  let src;
  try {
    src = readFileSync(path, 'utf8');
  } catch {
    console.warn(`skip: ${slug} (file not found)`);
    continue;
  }
  const fmMatch = src.match(/^---\n([\s\S]*?)\n---/);
  if (!fmMatch) {
    console.warn(`skip: ${slug} (no frontmatter)`);
    continue;
  }
  let fm = fmMatch[1];
  // Remove any pre-existing typed rel lines to avoid duplicates
  for (const k of TYPED_KEYS) {
    fm = fm.replace(new RegExp(`^${k}:.*$`, 'gm'), '');
  }
  fm = fm.replace(/\n{2,}/g, '\n').trimEnd();
  // Append new typed rel lines after `related:` if present, else at end
  const additions = Object.entries(fields)
    .map(([k, v]) => `${k}: [${v.map((r) => `'${r}'`).join(', ')}]`)
    .join('\n');
  if (/^related:/m.test(fm)) {
    fm = fm.replace(/(^related:.*$)/m, `$1\n${additions}`);
  } else {
    fm = fm + '\n' + additions;
  }
  const next = src.replace(/^---\n[\s\S]*?\n---/, `---\n${fm}\n---`);
  if (next !== src) {
    writeFileSync(path, next);
    changed++;
    console.log(`✓ ${slug}`);
  }
}

console.log(`\nseeded ${changed} files`);
