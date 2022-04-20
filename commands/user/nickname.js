import { SlashCommand } from '@aroleaf/djs-bot';

export default new SlashCommand({
  name: 'nickname',
  description: 'set your global nickname',
  options: [{
    type: 3,
    name: 'nickname',
    description: 'your new nickname (leave blank to remove)',
    required: false,
  }],
}, async interaction => {
  const nickname = interaction.options.getString('nickname');

  await interaction.client.db.User.updateOne(
    { user: interaction.user.id },
    { nickname },
    { upsert: true }
  );

  await interaction.reply({
    content: nickname 
      ? `Your global nickname has been set to "${nickname}".`
      : 'Your global nickname has been removed.',
    ephemeral: true
  });
});
