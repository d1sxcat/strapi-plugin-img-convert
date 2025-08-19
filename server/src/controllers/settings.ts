import type { Context } from 'koa';

import { getService } from '../utils';
import { ACTIONS } from '../constants';
import validateSettings from './validation/settings';

export default {
  async updateSettings(ctx: Context) {
    const {
      request: { body },
      state: { userAbility },
    } = ctx;

    if (userAbility.cannot(ACTIONS.readSettings)) {
      return ctx.forbidden();
    }

    const data = await validateSettings(body);

    await getService('settings').setSettings(data);

    ctx.body = { data };
  },

  async getSettings(ctx: Context) {
    const {
      state: { userAbility },
    } = ctx;

    if (userAbility.cannot(ACTIONS.readSettings)) {
      return ctx.forbidden();
    }

    const data = await getService('settings').getSettings();

    ctx.body = { data };
  },
};
