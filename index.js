import { Bot } from '@aroleaf/djs-bot';
import TCN from '@aroleaf/tcn-api';
import 'dotenv/config';

import commands from './commands.js';
import events from './events.js';

import * as db from './db/index.js';
import StickerCache from './lib/stickerCache.js';

const client = new Bot({
  commands, events,
  intents: [1<<0, 1<<5, 1<<9],
});

client.db = db;
client.tcn = TCN({ base: process.env.API_URL });
client.execs = await client.tcn.users.execs.get().then(res => Object.keys(res));
client.stickerCache = new StickerCache(client, 'cache');

client.login(process.env.TOKEN);