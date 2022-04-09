import { SlashCommand } from '@aroleaf/djs-bot';

export default new SlashCommand({
  name: 'disconnect',
  description: 'disconnect from a global channel',
}, async interaction => {
  const reply = content => interaction.reply({ content, ephemeral: true });

  if (!(interaction.client.execs.includes(interaction.user.id) || interaction.memberPermissions.has(1<<3))) return reply('Sorry, only TCN execs or admins can manage subscriptions');

  const connection = await interaction.client.db.Global.findOne({ subscriptions: interaction.channel.id });
  if (!connection) return reply('This channel is not connected to any global channel');

  delete interaction.channel.global;
  await connection.updateOne({ $pull: { subscriptions: interaction.channel.id } });

  await reply(`Connection to ${connection.name} removed!`);
});
