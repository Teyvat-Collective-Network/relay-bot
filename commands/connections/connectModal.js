import { ModalHandler } from '@aroleaf/djs-bot';
import GlobalManager from '../../lib/globalManager.js';
import * as util from '../../lib/util.js';

export default new ModalHandler({
  name: 'modal:connect'
}, async interaction => {
  const reply = content => interaction.reply({ content, ephemeral: true });

  const name = interaction.fields[0].value;

  const apiUser = interaction.client.tcn.users.get(interaction.user.id);
  if (!(apiUser.exec || apiUser.observer)) {
    if (!interaction.client.tcn.guilds.has(interaction.guild.id)) return reply('Sorry, only partnered server can connect to global channels.');
    if (!interaction.memberPermissions.has(1n<<3n)) return reply('Sorry, only TCN execs or admins can manage connections');
  }

  const global = await interaction.client.db.Global.findOne({ name });
  if (!global) return reply(`Sorry, ${name} is not a global channel.`);

  const exists = await interaction.client.db.Global.findOne({ subscriptions: interaction.channel.id });
  if (exists) return reply('Sorry, this channel already has a subscription, please remove it and try again.');

  interaction.channel.operations = new GlobalManager(interaction.channel);
  await global.updateOne({ $push: { subscriptions: interaction.channel.id } });

  await reply(`Subscription to ${name} added!`);

  util.log(util.fakeMessage(interaction, {
    content: `${interaction.user} connected ${interaction.channel}`,
  }), util.tags.connect, global).catch(() => {});
});