import { ApplicationCommandOptionType, PermissionFlagsBits } from '@aroleaf/djs-bot';
import { bulkPurgeMessages, fakeMessage, getTCNData, log, tags } from '../../../lib/util.js';
import parent from './index.js';

parent.subcommand({
  name: 'user',
  description: 'force-purges recent messages sent by a certain user',
  options: [{
    type: ApplicationCommandOptionType.User,
    name: 'user',
    description: 'The users whos messages you want to purge.',
    required: true,
  }, {
    type: ApplicationCommandOptionType.Integer,
    name: 'count',
    description: 'How many messages to purge. Defaults to 100.',
    minValue: 2,
    maxValue: 100,
  }],
}, async interaction => {
  await interaction.deferReply({ ephemeral: true });
  const reply = content => interaction.editReply({ content });
  
  const user = interaction.options.getUser('user');
  const messageCount = interaction.options.getInteger('count') || 100;
  
  const docs = await interaction.client.db.Message.find({ author: user.id }).sort({ _id: -1 }).limit(messageCount);
  const global = await interaction.client.db.Global.findOne({ subscriptions: mirror.channel });
  
  const tcnData = await getTCNData(interaction);
  if (user.id !== interaction.user.id && !tcnData.observer && !interaction.memberPermissions.has(PermissionFlagsBits.ManageMessages)) return reply('Only TCN observers and people who can manage messages can force-purge messages.');
  
  const { count, failed } = await bulkPurgeMessages(docs, interaction.client);
  await reply(`Deleted **${count}** messages.${failed.length 
    ? `\nDeletion failed for the following servers:\n**-** ${failed.map(guild => guild.name).join('\n**-** ')}` 
    : ''
  }`);

  return log(fakeMessage(interaction, {
    content: `purged **${messageCount}** of ${user}'s messages`,
  }), tags.bulk, global).catch(console.error);
});
