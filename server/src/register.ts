import type { Core } from '@strapi/strapi';
import { generateResponsiveFormats } from './services/image-manipulation';

const register = async ({ strapi }: { strapi: Core.Strapi }) => {
  const services = strapi.plugins['upload']?.services;
  if (!services) {
    throw new Error('Upload plugin services not found');
  }
  if (services['image-manipulation']['generateResponsiveFormats']) {
    services['image-manipulation']['generateResponsiveFormats'] = generateResponsiveFormats;
  }
};

export default register;
