import type { Core } from '@strapi/strapi';
import type { Settings } from '../controllers/validation/settings';

export default ({ strapi }: { strapi: Core.Strapi }) => {
  async function getSettings() {
    const res = await strapi.store!({ type: 'plugin', name: 'strapi-plugin-img-convert', key: 'settings' }).get(
      {}
    );

    return res as Settings | null;
  }

  function setSettings(value: Settings): Promise<void> {
    return strapi.store!({
      type: 'plugin',
      name: 'strapi-plugin-img-convert',
      key: 'settings',
    }).set({ value });
  }

  return {
    getSettings,
    setSettings,
  };
};
