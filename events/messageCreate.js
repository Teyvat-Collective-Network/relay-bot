import { Event, Events, MessageType } from '@aroleaf/djs-bot';

import check from '../filter/check.js';
import GlobalCreate from '../lib/globalCreate.js';
import GlobalManager from '../lib/globalManager.js';
import * as util from '../lib/util.js';

export default new Event({
  event: Events.MessageCreate,
}, async message => {
  if (message.partial) {
    const fetched = await message.fetch().catch(() => {});
    if (!fetched) return;
  }

  const webhook = message.webhookId && await util.ensureWebhook(message.channel, message.webhookId);
  if (webhook
    && ![MessageType.ChatInputCommand, MessageType.ContextMenuCommand].includes(message.type)
    && (!webhook.owner.bot || webhook.owner.id === message.client.user.id)
  ) return;

  if (/(?!<a?:\w+:\d+>)(.{2}|^.?):\w+:/.test(message.content) && await new Promise(resolve => {
    setTimeout(async () => resolve(util.isDeletedMessage(message)), 2500);
  })) return;

  const global = await message.client.db.subscription(message.channel);
  if (!global || global.panic) return;

  if (global.bans.includes(message.author.id)) return message.delete().catch(() => {});
  if(check(message.content)) {
    await message.delete().catch(() => {});
    return util.log(message, util.tags.blocked, global).catch(() => {});
  }

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
