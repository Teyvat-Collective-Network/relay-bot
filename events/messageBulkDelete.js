import DJS from '@aroleaf/djs-bot';
import GlobalBulkDelete from '../lib/globalBulkDelete.js';
import GlobalManager from '../lib/globalManager.js';
import * as util from '../lib/util.js';

export default new DJS.Event({
  event: DJS.Events.MessageBulkDelete,
}, async messages => {
  const client = messages.first().client;
  const global = await client.db.subscription(messages.first().channel);
  const docs = (await client.db.messages(messages)).filter(doc => !doc.purged);
  if (!docs.length) return;

  for (const [,msg] of messages) util.markDeletedMessage(msg);

  await client.db.Message.updateMany({ _id: { $in: docs.map(doc => doc._id) } }, { purged: true });

  const mirrors = [...new Set(docs.map(doc => doc.mirrors.concat(doc.original)).flat())];

  const action = new GlobalBulkDelete(docs);

  for (const mirror of mirrors) {
    const channel = client.channels.resolve(mirror.channel);
    if (!channel) continue;
    channel.global ||= new GlobalManager(channel);
    channel.global.push(action);
  }

  return util.log(util.fakeMessage(messages.first(), {
    content: `purged **${messages.size}** messages`,
    files: [{ name: 'messages.json', attachment: Buffer.from(JSON.stringify([...messages.values()], null, 2), 'utf8') }],
  }), util.tags.bulk, global);
});