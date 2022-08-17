import { SlashCommand } from '@aroleaf/djs-bot';

export default new SlashCommand({
  name: 'connect',
  description: 'connect to a global channel',
}, async interaction => {
  const reply = content => interaction.reply({ content, ephemeral: true });

  const apiUser = interaction.client.tcn.users.get(interaction.user.id);
  if (!(apiUser.exec || apiUser.observer)) {
    if (!interaction.client.tcn.guilds.has(interaction.guild.id)) return reply('Sorry, only partnered server can connect to global channels.');
    if (!interaction.memberPermissions.has(1n<<3n)) return reply('Sorry, only TCN execs or admins can manage subscriptions.');
  }

  return interaction.modal({
    customId: 'modal:connect',
    title: 'Connect to a global channel',
    fields: [{
      customId: 'global',
      label: 'global channel',
      placeholder: 'probably `TCN`',
      value: 'TCN',
      multiline: false,
      required: true,
    }],
  });
});