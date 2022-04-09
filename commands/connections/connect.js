import { SlashCommand } from '@aroleaf/djs-bot';

export default new SlashCommand({
  name: 'connect',
    description: 'connect to a global channel',
}, async interaction => {
  const reply = content => interaction.reply({ content, ephemeral: true });

  if (!interaction.client.execs.includes(interaction.user.id)) {
    if (await interaction.client.tcn.guilds(interaction.guild.id).get().then(res => res.error)) return reply('Sorry, only partnered server can connect to global channels.');
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