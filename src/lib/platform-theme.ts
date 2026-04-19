// Maps a platform name (as stored in streamer.primary_platform or the slug
// portion of a platforms:xxx ref) to a coherent accent color palette.

export interface PlatformTheme {
  key: string;
  name: string;
  accent: string;
  accent2: string;
  glow: string;
  mesh1: string;
  mesh2: string;
  logo?: string; // simple SVG path or letter fallback
}

export const PLATFORM_THEMES: Record<string, PlatformTheme> = {
  twitch: {
    key: 'twitch',
    name: 'Twitch',
    accent: '#9146ff',
    accent2: '#d4b3ff',
    glow: 'rgba(145, 70, 255, 0.35)',
    mesh1: 'rgba(145, 70, 255, 0.28)',
    mesh2: 'rgba(186, 130, 255, 0.12)',
  },
  kick: {
    key: 'kick',
    name: 'Kick',
    accent: '#53fc18',
    accent2: '#a7ff82',
    glow: 'rgba(83, 252, 24, 0.30)',
    mesh1: 'rgba(83, 252, 24, 0.22)',
    mesh2: 'rgba(23, 185, 120, 0.12)',
  },
  'youtube-live': {
    key: 'youtube-live',
    name: 'YouTube Live',
    accent: '#ff3b3b',
    accent2: '#ff8a8a',
    glow: 'rgba(255, 59, 59, 0.35)',
    mesh1: 'rgba(255, 59, 59, 0.24)',
    mesh2: 'rgba(255, 140, 140, 0.12)',
  },
  youtube: {
    key: 'youtube-live',
    name: 'YouTube',
    accent: '#ff3b3b',
    accent2: '#ff8a8a',
    glow: 'rgba(255, 59, 59, 0.35)',
    mesh1: 'rgba(255, 59, 59, 0.24)',
    mesh2: 'rgba(255, 140, 140, 0.12)',
  },
  'tiktok-live': {
    key: 'tiktok-live',
    name: 'TikTok Live',
    accent: '#25f4ee',
    accent2: '#fe2c55',
    glow: 'rgba(37, 244, 238, 0.30)',
    mesh1: 'rgba(37, 244, 238, 0.20)',
    mesh2: 'rgba(254, 44, 85, 0.18)',
  },
  tiktok: {
    key: 'tiktok-live',
    name: 'TikTok',
    accent: '#25f4ee',
    accent2: '#fe2c55',
    glow: 'rgba(37, 244, 238, 0.30)',
    mesh1: 'rgba(37, 244, 238, 0.20)',
    mesh2: 'rgba(254, 44, 85, 0.18)',
  },
  rumble: {
    key: 'rumble',
    name: 'Rumble',
    accent: '#85c742',
    accent2: '#d0ff88',
    glow: 'rgba(133, 199, 66, 0.30)',
    mesh1: 'rgba(133, 199, 66, 0.22)',
    mesh2: 'rgba(180, 255, 120, 0.10)',
  },
};

const DEFAULT: PlatformTheme = {
  key: 'default',
  name: 'Wiki',
  accent: '#a78bfa',
  accent2: '#22d3ee',
  glow: 'rgba(167, 139, 250, 0.28)',
  mesh1: 'rgba(167, 139, 250, 0.22)',
  mesh2: 'rgba(34, 211, 238, 0.12)',
};

export function normalizePlatformKey(raw: string | undefined | null): string {
  if (!raw) return 'default';
  let k = raw.trim().toLowerCase();
  if (k.startsWith('platforms:')) k = k.slice('platforms:'.length);
  k = k.replace(/\s+/g, '-');
  if (k === 'youtube') k = 'youtube-live';
  if (k === 'tiktok') k = 'tiktok-live';
  return k;
}

export function platformTheme(raw: string | undefined | null): PlatformTheme {
  const k = normalizePlatformKey(raw);
  return PLATFORM_THEMES[k] ?? DEFAULT;
}

// CSS variable overrides for a given platform theme — drop into a style={} prop.
export function platformVars(theme: PlatformTheme): string {
  return [
    `--accent: ${theme.accent}`,
    `--accent-2: ${theme.accent2}`,
    `--platform-glow: ${theme.glow}`,
    `--platform-mesh-1: ${theme.mesh1}`,
    `--platform-mesh-2: ${theme.mesh2}`,
  ].join('; ');
}
