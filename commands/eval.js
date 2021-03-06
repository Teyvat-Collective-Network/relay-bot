import * as Discord from '@aroleaf/djs-bot';
import { SlashCommand } from '@aroleaf/djs-bot';
import * as util from '../lib/util.js';
import { inspect } from 'util';

export default new SlashCommand({
  type: 3,
  name: 'eval',
}, async interaction => {
  const reply = content => interaction.reply({ content, ephemeral: true });
  
  if (interaction.user.id !== process.env.OWNER) return reply('You are not allowed to use `eval`');
  
  const message = interaction.options.resolved.messages.first();
  const codeblocks = message.content.split(/```(?:js)?(.+?)```/sg).filter((_,i) => i%2);
  if (!codeblocks.length) return reply('No code found');

  const env = {
    interaction,
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
  
  return interaction.reply({
    content: '**eval results**' + (out.length <= 1970 ? `\`\`\`ansi\n${out}\n\`\`\`` : ''),
    files: out.length > 1984 ? [{ name: 'results.ansi', attachment: Buffer.from(out) }] : [],
    ephemeral: true,
  });
});