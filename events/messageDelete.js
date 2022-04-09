import { Event } from '@aroleaf/djs-bot';
import GlobalDelete from '../lib/globalDelete.js';
import GlobalManager from '../lib/globalManager.js';
import * as util from '../lib/util.js';

export default new Event({
  event: 'messageDelete',
}, async message => {
  const doc = await message.client.db.Message.findOne({ $or: [ { 'original.message': message.id }, { 'mirrors.message': message.id } ] });
  if (!doc || doc.purged) return;

  const original = util.original(message.client, doc) || message;

  await doc.updateOne({ purged: true });
  
  const action = new GlobalDelete(doc); 
  
  for (const mirror of doc.mirrors.concat(mirror.original)) {
    const channel = message.client.channels.resolve(mirror.channel);
    if (!channel) return;
    channel.global ||= new GlobalManager(channel);
    channel.global.push(action);
  }
});