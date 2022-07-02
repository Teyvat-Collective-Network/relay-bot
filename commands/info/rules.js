import { SlashCommand } from '@aroleaf/djs-bot';
import getDocument from '../../docs/index.js';

export default new SlashCommand({
  name: 'rules',
  description: 'The rules of the global chat.',
  options: [{
    type: 5,
    name: 'public',
    description: 'Set this to true if other users should be able to see the rules',
  }],
}, async interaction => {
  const doc = await getDocument('rules');
  interaction.reply({
    embeds: doc.render(),
    ephemeral: !interaction.options.getBoolean('public'),
  });
});