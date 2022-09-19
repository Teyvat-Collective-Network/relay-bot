import { ApplicationCommandOptionType, SlashCommand } from '@aroleaf/djs-bot';
import getDocument from '../../docs/index.js';

export default new SlashCommand({
  name: 'partners',
  description: 'The TCN partner embed',
  options: [{
    type: ApplicationCommandOptionType.Boolean,
    name: 'public',
    description: 'Set this to true if other users should be able to see the embed',
  }, {
    type: ApplicationCommandOptionType.String,
    name: 'format',
    description: 'The format you want the partner embeds in. Defaults to sending the embeds.',
    choices: [
      'embeds',
      'JSON',
      'markdown',
    ].map(o => ({ name: o, value: o })),
  }],
}, async interaction => {
  const reply = data => interaction.reply({ ...data, ephemeral: !interaction.options.getBoolean('public') });
  
  const doc = await getDocument('partners');
  const render = { content: null, embeds: doc.render({ ul: '➜ ' }), attachments: [] };
  
  switch (interaction.options.getString('format') || 'embeds') {
    case 'embeds': return reply(render);
    case 'JSON': return reply({ files: [{ attachment: Buffer.from(JSON.stringify(render, null, 2), 'utf8'), name: 'partners.json' }] });
    case 'markdown': return reply({ files: [{ attachment: Buffer.from(doc.src, 'utf8'), name: 'partners.md' }] });
  }
});