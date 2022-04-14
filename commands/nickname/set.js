import Parent from "./index.js";

Parent.subcommand({
  name: 'set',
  description: 'set your global nickname override',
  options: [{
    type: 3,
    name: 'nickname',
    description: 'your new nickname',
    required: true,
  }],
}, async interaction => {
  const nickname = interaction.options.getString('nickname');

  await interaction.client.db.Nickname.findOneAndUpdate(
    { user_id: interaction.user.id },
    { nickname },
    { upsert: true }
  );

  await interaction.reply({ content: `Your global nickname override has been set to ${nickname}.`, ephemeral: true });
});