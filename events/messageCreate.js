import { Event } from '@aroleaf/djs-bot';

import check from '../filter/check.js';
import GlobalCreate from '../lib/globalCreate.js';
import GlobalManager from '../lib/globalManager.js';
import * as util from '../lib/util.js';

export default new Event({
  event: 'messageCreate',
}, async message => {
  const global = message.member && await message.client.db.subscription(message.channel);
  if (!global) return;

  if (global.bans.includes(message.author.id) || check(message.content)) return message.delete().catch(() => {});

  const data = await util.constructMessage(message, await message.client.db.reference(message));
  if (!data()) return;

  const doc = await message.client.db.Message.create({
    author: message.author.id,
    original: {
      channel: message.channel.id,
      message: message.id,
    },
    mirrors: [],
  });

  const action = new GlobalCreate(doc, data);

  for (const subscription of global.subscriptions.filter(sub => sub !== message.channel.id)) {
    const channel = message.client.channels.resolve(subscription);
    if (!channel) continue;
    channel.global ||= new GlobalManager(channel);
    channel.global.push(action);
  }
});