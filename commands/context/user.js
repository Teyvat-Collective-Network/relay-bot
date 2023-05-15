import { ContextCommand } from '@aroleaf/djs-bot';

export default new ContextCommand({
  type: 3,
  name: 'user',
}, async interaction => {
  await interaction.deferReply({ ephemeral: true });
  const reply = content => interaction.editReply(content);

  const message = interaction.options.resolved.messages.first();
  const doc = await interaction.client.db.Message.findOne({ $or: [ { 'original.message': message.id }, { 'mirrors.message': message.id } ] });

  if (!doc) return reply('Sorry, I couldn\'t find that message.');
  return reply(`<@${doc.author}> (${doc.author})`);
});