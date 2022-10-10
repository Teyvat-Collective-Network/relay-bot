import { ContextCommand, PermissionFlagsBits } from '@aroleaf/djs-bot';
import { getTCNData } from '../../lib/util.js';

export default new ContextCommand({
  type: 3,
  name: 'purge',
}, async interaction => {
  await interaction.deferReply({ ephemeral: true });
  const reply = content => interaction.editReply({ content });
  
  const message = interaction.options.resolved.messages.first();
  const tcnData = await getTCNData(interaction);
  if (!message.author.id === interaction.user.id && !tcnData.observer && !interaction.memberPermissions.has(PermissionFlagsBits.ManageMessages)) return reply('Only TCN observers and people who can manage messages can force-purge messages.');

  const doc = await interaction.client.db.Message.findOne({ $or: [ { 'original.message': message.id }, { 'mirrors.message': message.id } ] });
  if (!doc) return reply('Sorry, I couldn\'t find that message.');

  const { count, failed } = await purgeMessage(doc, interaction.client);
  return reply(`Deleted **${count}** messages.${failed.length 
    ? `\nDeletion failed for the following servers:\n**-** ${failed.map(guild => guild.name).join('\n**-** ')}` 
    : ''
  }`);
});