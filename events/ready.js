import { Event } from '@aroleaf/djs-bot';
import GlobalManager from '../lib/globalManager.js';
import telemetry from '../lib/telemetry.js';

export default new Event({
  event: 'ready',
  repeat: false,
}, async client => {
  const docs = await client.db.Global.find({});
  const channels = 
    [...new Set(docs.flatMap(doc => doc.subscriptions.concat(doc.logs||[])))]
    .map(id => client.channels.resolve(id))
    .filter(ch => ch);
  for (const channel of channels) {
    channel.global = new GlobalManager(channel);
  }
  telemetry.start();
});