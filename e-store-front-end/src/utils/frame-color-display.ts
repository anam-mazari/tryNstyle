/**
 * Maps common frame color names to CSS colors for swatches.
 * Unknown names fall back to a neutral gray.
 */
const COLOR_MAP: Record<string, string> = {
  black: '#1a1a1a',
  white: '#f5f5f5',
  silver: '#c0c0c0',
  gold: '#d4af37',
  rose: '#e8b4b8',
  'rose gold': '#b76e79',
  tortoise: '#5c4033',
  brown: '#5d4037',
  blue: '#2563eb',
  navy: '#1e3a5f',
  red: '#b91c1c',
  green: '#15803d',
  grey: '#9ca3af',
  gray: '#9ca3af',
  pink: '#ec4899',
  purple: '#7c3aed',
  clear: '#e8e8e8',
  transparent: '#e8e8e8',
  plastic: '#d1d5db',
  metal: '#9ca3af',
  titanium: '#71717a',
};

export function getFrameColorCss(frameColor: string | null | undefined): string {
  if (!frameColor?.trim()) {
    return '#d1d5db';
  }
  const key = frameColor.trim().toLowerCase();
  if (COLOR_MAP[key]) {
    return COLOR_MAP[key];
  }
  const firstToken = key.split(/[\s,/]+/)[0] ?? '';
  if (firstToken && COLOR_MAP[firstToken]) {
    return COLOR_MAP[firstToken];
  }
  return '#d1d5db';
}
