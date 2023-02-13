import { ApplicationCommandOptionType, SlashCommand } from '@aroleaf/djs-bot';
import GlobalManager from '../../lib/globalManager.js';
import * as autocomplete from '../../lib/autocomplete.js';
import * as util from '../../lib/util.js';

export default new SlashCommand({
  name: 'connect',
  description: 'connect to a global channel',
  options: [{
    type: ApplicationCommandOptionType.String,
    name: 'channel',
    description: 'the global channel you want to connect to',
    required: true,
    autocomplete: true,
    onAutocomplete: autocomplete.global,
  }],
}, async interaction => {
  const reply = content => interaction.reply({ content, ephemeral: true });

  const tcnData = await util.getTCNData(interaction);
  if (!tcnData.observer) {
    if (!tcnData.guild) return reply('Sorry, only partnered server can connect to global channels.');
    if (!interaction.memberPermissions.has(1n<<3n)) return reply('Sorry, only admins or TCN observers can manage subscriptions.');
  }

  if (!interaction.channel.permissionsFor(interaction.client.user).has([
    PermissionFlagsBits.ViewChannel,
    PermissionFlagsBits.ReadMessageHistory,
    PermissionFlagsBits.ManageWebhooks,
    PermissionFlagsBits.SendMessages,
    PermissionFlagsBits.ManageMessages,
  ])) return reply('Sorry, I need the following permissions to connect to this channel: View Channel, Read Message History, Manage Webhooks, Send Messages, and Manage Messages.');

  const name = interaction.options.getString('channel');

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