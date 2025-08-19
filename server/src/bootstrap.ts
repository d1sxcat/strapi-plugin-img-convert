import type { Core } from '@strapi/strapi';

const bootstrap = async ({ strapi }: { strapi: Core.Strapi }) => {
  const defaultConfig = {
    settings: {
      convertTo: 'webp',
      convertFromJPEG: true,
      convertFromPNG: true,
      convertFromTIFF: true,
    },
  };

  for (const [key, defaultValue] of Object.entries(defaultConfig)) {
    // set plugin store
    const configurator = strapi.store!({ type: 'plugin', name: 'strapi-plugin-img-convert', key });

    const config = await configurator.get({});
    if (
      config &&
      Object.keys(defaultValue).every((key) => Object.prototype.hasOwnProperty.call(config, key))
    ) {
      // eslint-disable-next-line no-continue
      continue;
    }

    await configurator.set({
      value: Object.assign(defaultValue, config || {}),
    });
  }

  await registerPermissionActions();
};

const registerPermissionActions = async () => {
  const actions = [
    {
      section: 'settings',
      displayName: 'Access the Image Converter settings page',
      uid: 'settings.read',
      category: 'media library',
      pluginName: 'strapi-plugin-img-convert',
    },
  ]

  await strapi.service('admin::permission').actionProvider.registerMany(actions);
}

export default bootstrap;
