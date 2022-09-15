import DJS from '@aroleaf/djs-bot';
import * as util from '../../lib/util.js';

export default new DJS.SlashCommand({
  name: 'ban',
  description: 'bans a user from this global chat',
  options: [{
    type: 6,
    name: 'user',
    description: 'the user you want to ban',
    required: true,
  }],
}, async interaction => {
  const reply = content => interaction.reply({ content, ephemeral: true });

  const tcnData = await util.getTCNData(interaction);
  if (!tcnData.observer) {
    if (!tcnData.guild) return reply('Sorry, only partnered server can ban people from global channels.');
    if (!interaction.memberPermissions.has(1n<<2n)) return reply('Sorry, only TCN execs or members with ban permissions can ban users.');
  }

  const global = await interaction.client.db.Global.findOne({ subscriptions: interaction.channel.id });
  if (!global) return reply('This channel is not connected to any global channel.');
  if (global.bans.includes(interaction.user.id)) return reply('Sorry, banned users can\'t ban other users.');

  const user = interaction.options.getUser('user');
  if (user.id === interaction.user.id) return reply('Sorry, you can\'t ban yourself.');
  await global.updateOne({ $push: { bans: user.id } });

  await reply(`banned ${user} from ${global.name}`);

  util.log(util.fakeMessage(interaction, {
    content: `${interaction.user} banned ${user}`,
  }), util.tags.ban, global).catch(() => {});
});