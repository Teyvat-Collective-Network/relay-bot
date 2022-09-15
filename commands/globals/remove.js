import Parent from './index.js';
import * as autocomplete from '../../lib/autocomplete.js';
import * as util from '../../lib/util.js';

Parent.subcommand({
  name: 'remove',
  description: 'remove a global channel',
  options: [{
    type: 3,
    name: 'name',
    description: 'the name of the global channel you want to remove',
    required: true,
    autocomplete: true,
    onAutocomplete: autocomplete.global,
  }],
}, async interaction => {
  const reply = content => interaction.reply({ content, ephemeral: true });

  const tcnData = await util.getTCNData(interaction);
  if (!tcnData.observer) return reply('Sorry, only TCN execs can remove global channels.');
  
  const global = await interaction.client.db.Global.findOne({ name: interaction.options.getString('name') });
  await global.deleteOne({ name: interaction.options.getString('name') });
  
  await reply(`global channel ${interaction.options.getString('name')} removed!`);

  util.log(util.fakeMessage(interaction, {
    content: `${interaction.user} deleted **${global.name}**`,
  }), util.tags.delete).catch(() => {});
});