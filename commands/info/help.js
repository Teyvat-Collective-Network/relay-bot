import DJS from '@aroleaf/djs-bot';
import getDocument from '../../docs/index.js';

export default new DJS.SlashCommand({
  name: 'help',
  description: 'TCN global bot help pages.',
  options: [{
    type: 3,
    name: 'page',
    description: 'The help page you want to view',
    choices: ['mods', 'admins', 'execs'].map(v => ({ name: v, value: v })),
    required: true,
  }],
}, async interaction => {
  const page = interaction.options.getString('page');
  const doc = await getDocument(`help/${page}`);
  interaction.reply({
    embeds: doc.render(),
    ephemeral: true,
  });
});