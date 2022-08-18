import DJS from '@aroleaf/djs-bot';
import GlobalDelete from '../lib/globalDelete.js';
import GlobalManager from '../lib/globalManager.js';
import * as util from '../lib/util.js';

export default new DJS.Event({
  event: DJS.Events.MessageDelete,
}, async message => {
  util.markDeletedMessage(message);
  const doc = await message.client.db.message(message);
  if (!doc || doc.purged) return;
  const global = await message.client.db.subscription(message.channel);

  if (global?.panic) return;

  await doc.updateOne({ purged: true });
  
  const action = new GlobalDelete(doc);
  
  for (const mirror of doc.mirrors.concat(doc.original)) {
    const channel = message.client.channels.resolve(mirror.channel);
    if (!channel) continue;
    channel.global ||= new GlobalManager(channel);
    channel.global.push(action);
  }

  const original = await util.original(message.client, doc) || message;
  
  util.log(original, util.tags.purge, global).catch(() => {});
});