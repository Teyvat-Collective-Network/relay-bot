import Parent from './index.js';

Parent.subcommand({
  name: 'remove',
  description: 'remove a global channel',
  options: [{
    type: 3,
    name: 'name',
    description: 'the name of the global channel you want to remove',
    required: true,
  }],
}, async interaction => {
  const reply = content => interaction.reply({ content, ephemeral: true });

  if (!interaction.client.execs.includes(interaction.user.id)) return reply('Sorry, only TCN execs can remove global channels.');
  const global = await interaction.client.db.Global.findOne({ name: interaction.options.getString('name') });
  await global.deleteOne({ name: interaction.options.getString('name') });
  await reply(`global channel ${interaction.options.getString('name')} removed!`);
});