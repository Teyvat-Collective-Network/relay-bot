import { Event } from '@aroleaf/djs-bot';
import GlobalBulkDelete from '../lib/globalBulkDelete.js';
import GlobalManager from '../lib/globalManager.js';

export default new Event({
  event: 'messageDeleteBulk',
}, async messages => {
  const client = messages.first().client;
  const global = await client.db.subscription(messages.first().channel);
  const docs = (await client.db.messages(messages)).filter(doc => !doc.purged);
  if (!docs.length) return;

  await client.db.Message.updateMany({ _id: { $in: docs.map(doc => doc._id) } }, { purged: true });

  const mirrors = [...new Set(docs.map(doc => doc.mirrors.concat(doc.original)))];

  const action = new GlobalBulkDelete(docs);

  for (const mirror of mirrors) {
    const channel = message.client.channels.resolve(mirror.channel);
    if (!channel) return;
    channel.global ||= new GlobalManager(channel);
    channel.global.push(action);
  }
});