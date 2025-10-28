import type { Settings, Breakpoints } from './types';

export const DEFAULT_BREAKPOINTS = {
  large: { breakpoint: 1000, formats: ['webp', 'jpeg'] },
  medium: { breakpoint: 750, formats: ['webp', 'jpeg'] },
  small: { breakpoint: 500, formats: ['webp', 'jpeg'] },
} satisfies Breakpoints;

export const getBreakpoints = () =>
  strapi.config.get<Breakpoints>('plugin::upload.breakpoints', DEFAULT_BREAKPOINTS);

export async function getSettings() {
  const res = await strapi.store!({ type: 'plugin', name: 'upload', key: 'settings' }).get({});

  return res as Settings | null;
}
