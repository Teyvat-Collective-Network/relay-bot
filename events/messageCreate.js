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

  // make sure it can't be its own message
  const webhook = message.webhookId && await util.ensureWebhook(message.channel, message.webhookId);
  if (webhook
    && ![MessageType.ChatInputCommand, MessageType.ContextMenuCommand].includes(message.type)
    && (!webhook.owner.bot || webhook.owner.id === message.client.user.id)
  ) return;

  // wait for potential NQN deletions
  if (/(?!<a?:\w+:\d+>)(.{2}|^.?):\w+:/.test(message.content) && await new Promise(resolve => {
    setTimeout(async () => resolve(util.isDeletedMessage(message)), 2500);
  })) return;

  const global = await message.client.db.subscription(message.channel);
  if (!global || global.panic) return;

  // require users to be a member of a server for at least 30 minutes before they can use the global chat there
  const THIRTY_MINUTES = 30 * 60 * 1000;
  if (!(message.member?.joinedTimestamp + THIRTY_MINUTES < Date.now())) {
    await message.delete().catch(() => {});
    return message.author.send('You joined that server too recently to use the global chat.').catch(() => {});
  }

  // check if the author is banned, or the message contains disallowed content
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
