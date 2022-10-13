import { Bot, Partials, util } from '@aroleaf/djs-bot';
import TCN from '@aroleaf/tcn-api';
import 'dotenv/config';

import * as db from './db/index.js';
import StickerCache from './lib/stickerCache.js';

const client = new Bot({
  owner: process.env.OWNER,
  commands: await util.loader('commands'),
  events: await util.loader('events'),
  prefix: 'gb!',
  intents: [1<<0, 1<<5, 1<<9, 1<<15],
  partials: [Partials.Message],
  register: {
    global: !!process.env.PRODUCTION,
    guilds: ['838473416310652998'],
  },
});

client.db = db;
client.tcn = new TCN(process.env.API_URL, process.env.API_TOKEN);
client.stickerCache = new StickerCache('cache', 'sticker_fallback.png');

client.login(process.env.TOKEN);