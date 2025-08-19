import type Settings from '../services/settings';
import type imgConvert from '../services/img-convert';

type Services = {
  settings: ReturnType<typeof Settings>;
  'img-convert': ReturnType<typeof imgConvert>;
};

export const getService = <TName extends keyof Services>(name: TName): Services[TName] => {
  return strapi.plugin('strapi-plugin-img-convert').service<Services[TName]>(name);
};