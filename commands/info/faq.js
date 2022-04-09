import { SlashCommand } from '@aroleaf/djs-bot';
import DME from 'discord-markdown-embeds';
import fs from 'fs/promises';
import path from 'path';

const doc = DME.render(await fs.readFile(path.resolve('docs/faq.md'), 'utf8')).messages()[0];

export default new SlashCommand({
  name: 'faq',
  description: 'Info about the TCN global chat and the bot powering it.',
  options: [{
    type: 5,
    name: 'public',
    description: 'Set this to true if other users should be able to see the FAQ',
  }],
}, interaction => {
  doc.ephemeral = !interaction.options.getBoolean('public');
  interaction.reply(doc);
});