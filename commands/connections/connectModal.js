import { ModalHandler } from '@aroleaf/djs-bot';
import GlobalManager from '../../lib/globalManager.js';

export default new ModalHandler({
  name: 'modal:connect'
}, async interaction => {
  const reply = content => interaction.reply({ content, ephemeral: true });

  const name = interaction.fields[0].value;

  if (!interaction.client.execs.includes(interaction.user.id)) {
    if (await interaction.client.tcn.guilds(interaction.guild.id).get().then(res => res.error)) return reply('Sorry, only partnered server can ban people from global channels.');
    if (!interaction.memberPermissions.has(1n<<2n)) return reply('Sorry, only TCN execs or members with ban permissions can ban users.');
  }

  const global = await interaction.client.db.Global.findOne({ name });
  if (!global) return reply(`Sorry, ${name} is not a global channel.`);

  const exists = await interaction.client.db.Global.findOne({ subscriptions: interaction.channel.id });
  if (exists) return reply('Sorry, this channel already has a subscription, please remove it and try again.');

  interaction.channel.operations = new GlobalManager(interaction.channel);
  await global.updateOne({ $push: { subscriptions: interaction.channel.id } });

  reply(`Subscription to ${name} added!`);
});