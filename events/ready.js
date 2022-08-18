import DJS from '@aroleaf/djs-bot';
import GlobalManager from '../lib/globalManager.js';

export default new DJS.Event({
  event: DJS.Events.ClientReady,
  repeat: false,
}, async client => {
  const docs = await client.db.Global.find({});
  const channels = 
    [...new Set(docs.flatMap(doc => doc.subscriptions))]
    .map(id => client.channels.resolve(id))
    .filter(ch => ch);
  for (const channel of channels) {
    channel.global = new GlobalManager(channel);
  }
});