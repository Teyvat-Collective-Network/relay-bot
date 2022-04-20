import { SlashCommand } from '@aroleaf/djs-bot';
import * as util from '../../lib/util.js';

export default new SlashCommand({
  name: 'disconnect',
  description: 'disconnect from a global channel',
}, async interaction => {
  const reply = content => interaction.reply({ content, ephemeral: true });

  const apiUser = interaction.client.tcn.users.get(interaction.user.id);
  if (!(apiUser.exec || apiUser.observer || interaction.memberPermissions.has(1<<3))) return reply('Sorry, only TCN execs or admins can manage subscriptions');

  const connection = await interaction.client.db.subscription(interaction.channel);
  if (!connection) return reply('This channel is not connected to any global channel');

  delete interaction.channel.global;
  await connection.updateOne({ $pull: { subscriptions: interaction.channel.id } });

  await reply(`Connection to ${connection.name} removed!`);

  util.log(util.fakeMessage(interaction, {
    content: `${interaction.user} disconnected ${interaction.channel}`,
  }), util.tags.disconnect, connection).catch(() => {});
});
