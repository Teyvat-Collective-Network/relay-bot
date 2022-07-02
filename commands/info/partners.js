import { SlashCommand } from '@aroleaf/djs-bot';
import getDocument from '../../docs/index.js';

export default new SlashCommand({
  name: 'partners',
  description: 'The TCN partner embed',
  options: [{
    type: 5,
    name: 'public',
    description: 'Set this to true if other users should be able to see the embed',
  }],
}, async interaction => {
  const doc = await getDocument('partners');
  interaction.reply({
    embeds: doc.render({ ul: '➜ ' }),
    ephemeral: !interaction.options.getBoolean('public'),
  });
});