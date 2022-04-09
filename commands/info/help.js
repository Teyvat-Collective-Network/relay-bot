import { SlashCommand } from '@aroleaf/djs-bot';
import DME from 'discord-markdown-embeds';
import fs from 'fs/promises';
import path from 'path';

const docFiles = await fs.readdir(path.resolve('docs'));
const docs = Object.fromEntries(await Promise.all(docFiles.map(async file => [file, DME.render(await fs.readFile(path.resolve('docs', file), 'utf8')).messages()[0]])));

export default new SlashCommand({
  name: 'help',
  description: 'TCN global bot help pages.',
  options: [{
    type: 3,
    name: 'page',
    description: 'The help page you want to view',
    choices: ['mods', 'admins', 'execs'].map(v => ({ name: v, value: v+'.md' })),
    required: true,
  }],
}, interaction => {
  const msg = docs[interaction.options.getString('page')];
  msg.ephemeral = true;
  interaction.reply(msg);
});