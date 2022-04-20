import { SlashCommand } from '@aroleaf/djs-bot';
import DME from 'discord-markdown-embeds';
import fs from 'fs/promises';
import path from 'path';

const doc = DME.render(await fs.readFile(path.resolve('docs/partners.md'), 'utf8'), { ul: '➜ ' }).messages()[0];

export default new SlashCommand({
  name: 'partners',
  description: 'The TCN partner embed',
  options: [{
    type: 5,
    name: 'public',
    description: 'Set this to true if other users should be able to see the embed',
  }],
}, interaction => {
  doc.ephemeral = !interaction.options.getBoolean('public');
  interaction.reply(doc);
});