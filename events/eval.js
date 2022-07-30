import { Event } from '@aroleaf/djs-bot';
import { inspect } from 'util';

import * as util from '../lib/util.js';

export default new Event({
  event: 'messageCreate',
}, async message => {
  if (!message.content.startsWith('gb!eval') || message.author.id !== process.env.OWNER) return;
  const code = message.content.slice('gb!eval'.length);

  let res;
  try {
    const f = eval(`async () => {${code}}`);
    res = await f().catch(e => e);
  } catch (error) {
    res = error;
  }
  
  message.channel.send({
    content: '**eval results**',
    files: [{ name: 'results.js', attachment: Buffer.from(inspect(res, {
      depth: 4,
      breakLength: null,
      numericSeparator: true,
    })) }],
  })
});