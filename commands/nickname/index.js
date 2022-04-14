import { SlashCommand } from '@aroleaf/djs-bot';

export default new SlashCommand({
  name: 'nickname',
  description: 'alter your global nickname override',
  options: [{
    type: 3,
    name: 'nickname',
    description: 'your new nickname (leave blank to remove)',
    required: false,
  }],
}, async interaction => {
  const nickname = interaction.options.getString('nickname');

  await interaction.client.db.User.updateOne(
    { user_id: interaction.user.id },
    { nickname },
    { upsert: true }
  );

  await interaction.reply({
    content: nickname ? `Your global nickname override has been set to ${nickname}.` : 'Your global nickname override has been removed.',
    ephemeral: true
  });
});
