import { Event } from '@aroleaf/djs-bot';
import { diffWords } from 'diff';

import * as util from '../lib/util.js';
import GlobalUpdate from '../lib/globalUpdate.js';
import check from '../filter/check.js';
import GlobalManager from '../lib/globalManager.js';

const regex = {
  escape: /(?<!\\)((?:\\\\)*)([\[\]\(\)*~_`])/,
  trim: /^(\s*)(.*?)(\s*)$/,
}

export default new Event({
  event: 'messageUpdate',
}, async (old, message) => {
  message.channel.webhooks ??= await message.channel.fetchWebhooks().catch(() => {});
  if (message.channel.webhooks.get(message.webhookId)?.owner?.id === message.client.user.id) return;

  const global = await message.client.db.subscription(message.channel);
  if (!global) return;

  const diff = diffWords(old.content || '', message.content || '').map(res => {
    const out = res.value;
    if (res.added) return out.replace(regex.escape, '$1\\$2').replace(regex.trim, '$1**$2**$3');
    if (res.removed) return out.replace(regex.escape, '$1\\$2').replace(regex.trim, '$1~~$2~~$3');
    return (out.length > 32 ? `${out.slice(0, 16)}...${out.slice(out.length-16, out.length)}` : out).replace(regex.escape, '$1\\$2');
  }).join('');
  
  if (global.bans.includes(message.author.id)) return;
  if(check(message.content)) return util.log(Object.assign(Object.create(message), {
    content: diff,
  }), util.tags.blocked, global).catch(() => {});

  if (old.embeds.filter(e => e.type !== 'rich').length !== message.embeds.filter(e => e.type !== 'rich').length) return;

  const doc = await message.client.db.message(message);
  if (!doc) return;

  const data = await util.constructMessage(message, await message.client.db.reference(message));
  if (!data()) return;

  const action = new GlobalUpdate(doc, data);

  for (const mirror of doc.mirrors) {
    const channel = message.client.channels.resolve(mirror.channel);
    if (!channel) continue;
    channel.global ||= new GlobalManager(channel);
    channel.global.push(action);
  }

  util.log(Object.assign(Object.create(message), {
    content: diff,
  }), util.tags.edit, global).catch(() => {});
});