import { ApplicationCommandOptionType, PermissionFlagsBits } from '@aroleaf/djs-bot';
import { getTCNData, purgeMessage } from '../../../lib/util.js';

import parent from './index.js';

parent.subcommand({
  name: 'message',
  description: 'force-purge a global chat message',
  options: [{
    type: ApplicationCommandOptionType.String,
    name: 'message',
    description: 'the id or link of the message you want to force-purge',
    required: true,
  }],
}, async interaction => {
  await interaction.deferReply({ ephemeral: true });
  const reply = content => interaction.editReply({ content });
  
  const messageId = interaction.options.getString('message');
  
  const doc = await interaction.client.db.Message.findOne({ $or: [ { 'original.message': messageId }, { 'mirrors.message': messageId } ] });
  const mirror = doc?.mirrors.concat(doc.original).find(m => m.message === messageId);
  
  const message = mirror && await interaction.client.channels.resolve(mirror.channel)?.messages.fetch(mirror.message);
  if (!message) return reply('Sorry, I couldn\'t find that message.');
  
  const tcnData = await getTCNData(interaction);
  if (!message.author.id === interaction.user.id && !tcnData.observer && !interaction.memberPermissions.has(PermissionFlagsBits.ManageMessages)) return reply('Only TCN observers and people who can manage messages can force-purge messages.');
  
  const { count, failed } = await purgeMessage(doc, interaction.client);
  return reply(`Deleted **${count}** messages.${failed.length 
    ? `\nDeletion failed for the following servers:\n**-** ${failed.map(guild => guild.name).join('\n**-** ')}` 
    : ''
  }`);
});