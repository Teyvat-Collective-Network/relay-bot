import DJS from '@aroleaf/djs-bot';
import getDocument from '../docs/index.js';

export default new DJS.SlashCommand({
  name: 'json-doc',
  description: 'Render the global bot\'s doc embeds to JSON',
  options: [{
    type: DJS.ApplicationCommandOptionType.String,
    name: 'doc',
    description: 'The doc to render',
    required: true,
  }],
}, async interaction => {
  const name = interaction.options.getString('doc');
  const doc = /\w+/.test(name) && await getDocument(name).catch(() => {});
  if (!doc) return interaction.reply({ content: 'Sorry, I couldn\'t find that document.', ephemeral: true });
  interaction.reply({
    files: [{
      attachment: Buffer.from(JSON.stringify(doc.render({ ul: '➜ ' }).messages()[0], null, 2)),
      name: `${name}.json`,
    }],
    ephemeral: !interaction.options.getBoolean('public'),
  });
});