import DJS from '@aroleaf/djs-bot';
import TCN from '@aroleaf/tcn-api';
import 'dotenv/config';

import commands from './commands.js';
import events from './events.js';

import * as db from './db/index.js';
import StickerCache from './lib/stickerCache.js';

const client = new DJS.Bot({
  commands, events,
  intents: [1<<0, 1<<5, 1<<9, 1<<15],
  register: {
    global: process.env.PRODUCTION,
    guilds: ['838473416310652998'],
  },
});

client.db = db;
client.tcn = new TCN.Client({ base: process.env.API_URL, secure: !process.env.API_URL?.startsWith('localhost') });
client.stickerCache = new StickerCache('cache', 'sticker_fallback.png');

client.login(process.env.TOKEN);