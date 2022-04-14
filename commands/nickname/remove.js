import Parent from "./index.js";

Parent.subcommand({
  name: 'remove',
  description: 'remove your global nickname override',
  options: [],
}, async interaction => {
  await interaction.client.db.Nickname.findOneAndDelete({ user_id: interaction.user.id });

  await interaction.reply({ content: 'Your global nickname override has been removed.', ephemeral: true });
});