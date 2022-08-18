import DJS from '@aroleaf/djs-bot';
import getDocument from '../../docs/index.js';

export default new DJS.SlashCommand({
  name: 'faq',
  description: 'Info about the TCN global chat and the bot powering it.',
  options: [{
    type: 5,
    name: 'public',
    description: 'Set this to true if other users should be able to see the FAQ',
  }],
}, async interaction => {
  const doc = await getDocument('faq');
  interaction.reply({
    embeds: doc.render(),
    ephemeral: !interaction.options.getBoolean('public'),
  });
});