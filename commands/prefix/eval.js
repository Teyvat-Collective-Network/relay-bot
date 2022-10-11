import { PrefixCommand } from '@aroleaf/djs-bot';
import { CommandFlagsBitField } from '@aroleaf/djs-bot';

export default new PrefixCommand({
  name: 'eval',
  flags: [CommandFlagsBitField.Flags.OWNER_ONLY],
}, async message => {
  const codeblocks = message.content.split(/```(?:js|javascript)?(.+?)```/sg).filter((_,i) => i%2);
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
  
  return message.reply({
    content: '**eval results**' + (out.length <= 1970 ? `\`\`\`ansi\n${out}\n\`\`\`` : ''),
    files: out.length > 1984 ? [{ name: 'results.ansi', attachment: Buffer.from(out) }] : [],
    allowedMentions: { repliedUser: false },
  });
});