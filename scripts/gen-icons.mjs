#!/usr/bin/env node
// Generate PNG favicon variants + apple-touch-icon from the master SVG.
// Uses the @resvg/resvg-js dep already in the build pipeline.

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { Resvg } from '@resvg/resvg-js';

const ROOT = new URL('..', import.meta.url).pathname;
const SVG = readFileSync(join(ROOT, 'public/favicon.svg'), 'utf8');

const outputs = [
  { name: 'favicon-16.png', size: 16 },
  { name: 'favicon-32.png', size: 32 },
  { name: 'favicon-96.png', size: 96 },
  { name: 'favicon-192.png', size: 192 },
  { name: 'favicon-512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
];

for (const { name, size } of outputs) {
  const resvg = new Resvg(SVG, { fitTo: { mode: 'width', value: size } });
  const png = resvg.render().asPng();
  writeFileSync(join(ROOT, 'public', name), png);
  console.log(`✓ ${name} (${size}×${size})`);
}
