import { SlashCommand } from '@aroleaf/djs-bot';

export default new SlashCommand({
  name: 'unpanic',
  description: 'Takes a global channel out of panic mode',
}, async interaction => {
  const reply = content => interaction.reply({ content, ephemeral: true });

  const apiUser = interaction.client.tcn.users.get(interaction.user.id);
  if (!(apiUser.exec || apiUser.observer)) return reply('Only observers are allowed to take a global channel out of panic mode.');

  const global = await interaction.client.db.subscription(interaction.channel);
  if (!global) return reply('This channel is not connected to a global channel.');

  await interaction.client.db.unpanic(global);
  await reply('This global channel has been taken out of panic mode.');

  return interaction.client.channels.resolve(global.logs || process.env.LOGS)?.send({
    content: `${interaction.user} disabled panic mode for ${global.name}.`,
  });
});