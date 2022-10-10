import { ApplicationCommandOptionType, SlashCommand } from '@aroleaf/djs-bot';

export default new SlashCommand({
  name: 'user',
  description: 'Fetch the author of a global chat message.',
  options: [{
    type: ApplicationCommandOptionType.String,
    name: 'message',
    description: 'the id or link of the message you want to fetch the author of',
    required: true,
  }],
}, async interaction => {
  const reply = content => interaction.reply({ content, ephemeral: true });

  const messageId = interaction.options.getString('message')?.match(/(\d+)\/?/)?.[1];
  const doc = messageId && await interaction.client.db.Message.findOne({ $or: [ { 'original.message': messageId }, { 'mirrors.message': messageId } ] });

  if (!doc) return reply('Sorry, I couldn\'t find that message.');
  return reply(`<@${doc.author}> (${doc.author})`);
});