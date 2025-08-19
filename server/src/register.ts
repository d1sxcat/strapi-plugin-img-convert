import type { Core } from '@strapi/strapi';
import imgMiddleware from './middlewares/img-convert';

const register = async ({ strapi }: { strapi: Core.Strapi }) => {
  const apiRoutes = strapi.plugins['upload']?.routes;

  if (!Array.isArray(apiRoutes)) {
    apiRoutes?.['admin']?.routes
      ?.filter((route) => route.handler === 'admin-upload.upload')
      .map((route) => {
        route.config.middlewares = [imgMiddleware, ...(route.config.middlewares || [])];
      });
  }
};

export default register;
