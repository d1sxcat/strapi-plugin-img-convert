import type { Settings, Breakpoints, FormatOptions } from './types';

export const DEFAULT_BREAKPOINTS = {
  large: { breakpoint: 1000, formats: ['webp', 'jpeg'] },
  medium: { breakpoint: 750, formats: ['webp', 'jpeg'] },
  small: { breakpoint: 500, formats: ['webp', 'jpeg'] },
} satisfies Breakpoints;

export const DEFAULT_OPTIONS = {
  jpeg: { quality: 80 },
  png: { quality: 80 },
  webp: { quality: 80 },
  avif: { quality: 80 },
} satisfies FormatOptions;

export const getBreakpoints = () =>
  strapi.config.get<Breakpoints>('plugin::upload.breakpoints', DEFAULT_BREAKPOINTS);

export const getOptimizeSettings = () =>
  strapi.config.get<FormatOptions>(
    'plugin::upload.optimizeSettings',
    DEFAULT_OPTIONS
  );

export async function getSettings() {
  const res = await strapi.store!({ type: 'plugin', name: 'upload', key: 'settings' }).get({});

  return res as Settings | null;
}
