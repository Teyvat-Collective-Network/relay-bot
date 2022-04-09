import Parent from './index.js';

Parent.subcommand({
  name: 'list',
  description: 'list all global channels',
}, async interaction => {
  const reply = content => interaction.reply({ content, ephemeral: true });

  const globals = await interaction.client.db.Global.find();
  return reply(`all global channels: ${globals.map(g=>g.name).join(', ')}`);
});