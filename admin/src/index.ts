import { getTranslation } from './utils/getTranslation';
import { PLUGIN_ID } from './pluginId';
import { Initializer } from './components/Initializer';
import { PERMISSIONS } from './constants';
import { prefixPluginTranslations } from './utils/prefixPluginTranslations';

export default {
  register(app: any) {
    app.registerPlugin({
      id: PLUGIN_ID,
      initializer: Initializer,
      isReady: false,
      name: PLUGIN_ID,
    });
  },
  bootstrap(app: any) {
    app.addSettingsLink('global', {
      id: 'img-convert-settings',
      to: PLUGIN_ID,
      intlLabel: {
        id: getTranslation('plugin.name'),
        defaultMessage: 'Image Convert',
      },
      async Component() {
        const { ProtectedSettingsPage } = await import('./pages/SettingsPage/SettingsPage');
        return { default: ProtectedSettingsPage };
      },
      permissions: PERMISSIONS.settings,
    });
  },

  async registerTrads({ locales }: { locales: string[] }) {
    const importedTrads = await Promise.all(
      locales.map((locale) => {
        return import(`./translations/${locale}.json`)
          .then(({ default: data }) => {
            return {
              data: prefixPluginTranslations(data, PLUGIN_ID),
              locale,
            };
          })
          .catch(() => {
            return {
              data: {},
              locale,
            };
          });
      })
    );

    return Promise.resolve(importedTrads);
  },

};
