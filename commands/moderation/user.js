import DJS from '@aroleaf/djs-bot';

export default new DJS.ContextCommand({
  type: 3,
  name: 'user',
}, async interaction => {
  const reply = content => interaction.reply({ content, ephemeral: true });

  const message = interaction.options.resolved.messages.first();
  const doc = await interaction.client.db.Message.findOne({ $or: [ { 'original.message': message.id }, { 'mirrors.message': message.id } ] });

  if (!doc) return reply('Sorry, I couldn\'t find that message.');
  return reply(`<@${doc.author}> (${doc.author})`);
});