import fzy from 'fzy.js';
import { ApplicationCommandOptionType, SlashCommand } from '@aroleaf/djs-bot';
import GlobalManager from '../../lib/globalManager.js';
import * as util from '../../lib/util.js';

function filter(list, query, map = i => i) {
  return query ? list.filter(i => fzy.hasMatch(query, map(i))).sort((a, b) => fzy.score(query, map(b)) - fzy.score(query, map(a))) : list;
}

export default new SlashCommand({
  name: 'connect',
  description: 'connect to a global channel',
  options: [{
    type: ApplicationCommandOptionType.String,
    name: 'channel',
    description: 'the global channel you want to connect to',
    required: true,
    autocomplete: true,
    onAutocomplete: async interaction => {
      const globals = await interaction.client.db.Global.find();
      return interaction.respond(filter(
        globals,
        interaction.options.getFocused().toLowerCase(),
        g => g.name.toLowerCase()
      ).map(g => ({ name: g.name, value: g.name })).slice(0, 25));
    },
  }]
}, async interaction => {
  const reply = content => interaction.reply({ content, ephemeral: true });

  const apiUser = interaction.client.tcn.users.get(interaction.user.id);
  if (!(apiUser.exec || apiUser.observer)) {
    if (!interaction.client.tcn.guilds.has(interaction.guild.id)) return reply('Sorry, only partnered server can connect to global channels.');
    if (!interaction.memberPermissions.has(1n<<3n)) return reply('Sorry, only TCN execs or admins can manage subscriptions.');
  }

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