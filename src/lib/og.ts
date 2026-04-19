import satori from 'satori';
import { html } from 'satori-html';
import { Resvg } from '@resvg/resvg-js';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const fontPath = join(process.cwd(), 'node_modules/@fontsource/inter/files');

let cachedFonts: { regular: Buffer; bold: Buffer } | null = null;
function loadFonts() {
  if (cachedFonts) return cachedFonts;
  cachedFonts = {
    regular: readFileSync(join(fontPath, 'inter-latin-500-normal.woff')),
    bold: readFileSync(join(fontPath, 'inter-latin-800-normal.woff')),
  };
  return cachedFonts;
}

const TYPE_LABEL: Record<string, string> = {
  streamers: 'Streamer',
  platforms: 'Platform',
  concepts: 'Concept',
  events: 'Event',
  orgs: 'Organization',
};

// Wayfinding colors by entity type — used sparingly on the OG card so the
// brand reads monochromatic-violet first, type-accented second.
const TYPE_COLOR: Record<string, string> = {
  streamers: '#7c5cff',
  platforms: '#00c2ff',
  concepts: '#ffb020',
  events: '#ff4a4a',
  orgs: '#21d07a',
};

const BRAND_HERO = '#7c5cff';
const BRAND_BG = '#0e0d15';
const BRAND_TEXT = '#efeff1';
const BRAND_DIM = '#adadb8';
const BRAND_FAINT = '#6f6d7e';

export interface OgInput {
  type: keyof typeof TYPE_LABEL;
  name: string;
  description: string;
  meta?: string;
}

export async function renderOgPng({ type, name, description, meta }: OgInput): Promise<Buffer> {
  const fonts = loadFonts();
  const color = TYPE_COLOR[type] ?? '#a78bfa';
  const label = TYPE_LABEL[type] ?? 'Entry';

  const markup = html(`
    <div style="display:flex;flex-direction:column;justify-content:space-between;width:1200px;height:630px;padding:72px;background:${BRAND_BG};color:${BRAND_TEXT};font-family:Inter;position:relative;">
      <div style="position:absolute;inset:0;background:radial-gradient(ellipse 75% 55% at 20% 0%, ${BRAND_HERO}42, transparent 70%);display:flex;"></div>
      <div style="position:absolute;inset:0;background:radial-gradient(ellipse 55% 45% at 95% 100%, ${color}28, transparent 70%);display:flex;"></div>
      <div style="display:flex;align-items:center;gap:14px;z-index:1;">
        <div style="width:12px;height:12px;border-radius:50%;background:${color};display:flex;"></div>
        <div style="font-size:20px;color:${BRAND_DIM};letter-spacing:0.14em;text-transform:uppercase;font-weight:800;display:flex;">${label}</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:24px;z-index:1;">
        <div style="font-size:92px;font-weight:800;line-height:1.02;letter-spacing:-0.035em;color:#fff;display:flex;">${escapeHtml(name)}</div>
        <div style="font-size:30px;color:${BRAND_DIM};line-height:1.3;max-width:1000px;display:flex;">${escapeHtml(truncate(description, 160))}</div>
        ${meta ? `<div style="font-size:22px;color:${BRAND_HERO};font-weight:800;letter-spacing:0.02em;display:flex;">${escapeHtml(meta)}</div>` : ''}
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between;z-index:1;">
        <div style="display:flex;align-items:center;gap:4px;font-size:26px;font-weight:900;color:#fff;letter-spacing:-0.03em;">
          <span style="display:flex;">streamers</span>
          <span style="display:flex;width:8px;height:8px;border-radius:50%;background:#ff3b3b;margin:0 4px 6px 4px;"></span>
          <span style="display:flex;">wiki</span>
        </div>
        <div style="font-size:18px;color:${BRAND_FAINT};display:flex;">Rooted in life · 0mn1.one</div>
      </div>
    </div>
  `);

  const svg = await satori(markup as any, {
    width: 1200,
    height: 630,
    fonts: [
      { name: 'Inter', data: fonts.regular, weight: 500, style: 'normal' },
      { name: 'Inter', data: fonts.bold, weight: 800, style: 'normal' },
    ],
  });

  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } });
  return resvg.render().asPng();
}

function truncate(s: string, n: number) {
  if (s.length <= n) return s;
  return s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…';
}

function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
