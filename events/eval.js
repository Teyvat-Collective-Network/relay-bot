import * as Discord from '@aroleaf/djs-bot';
import { Event } from '@aroleaf/djs-bot';
import { inspect } from 'util';

import * as util from '../lib/util.js';

export default new Event({
  event: 'messageCreate',
}, async message => {
  if (!message.content.startsWith('gb!eval') || message.author.id !== process.env.OWNER) return;
  
  const codeblocks = message.content.split(/```(?:js)?(.+?)```/sg).filter((_,i) => i%2);
  if (!codeblocks.length) return reply('No code found');

  const env = {
    message,
    Discord,
    util,
  }

  let res;
  try {
    res = await Function(`
      return async function(env) {
        ${Object.keys(env).map(k => `let ${k} = env['${k}'];`).join('\n')}
        ${codeblocks.join('\n')}
      }
    `)()(env).catch(e => e);
  } catch (error) {
    res = error;
  }

  const out = inspect(res, {
    colors: true,
    depth: 4,
    breakLength: null,
    numericSeparator: true,
  });
  
  return message.channel.send({
    content: '**eval results**' + (out.length <= 1970 ? `\`\`\`ansi\n${out}\n\`\`\`` : ''),
    files: out.length > 1984 ? [{ name: 'results.ansi', attachment: Buffer.from(out) }] : [],
  });
});