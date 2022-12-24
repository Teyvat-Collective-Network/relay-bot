import DJS from '@aroleaf/djs-bot';
import { getTCNData } from '../lib/util.js';

export default new DJS.SlashCommand({
  name: 'panic',
  description: 'Instantly shuts down an entire global channel in case of emergency',
}, async interaction => {
  const reply = content => interaction.reply({ content, ephemeral: true }).catch(() => {});

  const tcnData = await getTCNData(interaction);
  if (!tcnData.observer && !interaction.member.permissions.has(DJS.PermissionFlagsBits.ManageMessages)) return reply('You are missing the permissions to manage messages.');

  const global = await interaction.client.db.subscription(interaction.channel);
  if (!global) return reply('This channel is not connected to a global channel.');
  if (global.bans.includes(interaction.user.id)) return reply('You are banned from this global channel.');

  await interaction.client.db.panic(global);
  for (const channel of global.subscriptions.map(sub => interaction.client.channels.resolve(sub)).filter(c => c)) {
    channel.global.panic();
  }
  
  await interaction.client.channels.resolve(global.logs || process.env.LOGS)?.send({
    content: `<@&${process.env.PANIC_ROLE}>, ${interaction.user} enabled panic mode for ${global.name}. Once everything is stable again, use \`/unpanic\` to disable panic mode.`,
  }).catch(() => {});

  return reply('This global channel has been put into panic mode.');
});