import { SlashCommand } from '@aroleaf/djs-bot';
import * as util from '../../lib/util.js';

export default new SlashCommand({
  name: 'unban',
  description: 'unbans a user from this global chat',
  options: [{
    type: 6,
    name: 'user',
    description: 'the user you want to unban',
    required: true,
  }],
}, async interaction => {
  const reply = content => interaction.reply({ content, ephemeral: true });

  if (!interaction.client.execs.includes(interaction.user.id)) {
    if (await interaction.client.tcn.guilds(interaction.guild.id).get().then(res => res.error)) return reply('Sorry, only partnered server can unban people from global channels.');
    if (!interaction.memberPermissions.has(1n<<2n)) return reply('Sorry, only TCN execs or members with ban permissions can unban users.');
  }

  const global = await interaction.client.db.Global.findOne({ subscriptions: interaction.channel.id });
  if (!global) return reply('This channel is not conencted to any global channel.');
  if (global.bans.includes(interaction.user.id)) return reply('Sorry, banned users can\'t unban other users.');
  
  const user = interaction.options.getUser('user');
  if (!global.bans.includes(user.id)) return reply('That user isn\'t banned.');
  await global.updateOne({ $pull: { bans: user.id } });

  await reply(`unbanned ${user} from ${global.name}`);

  util.log(util.fakeMessage(interaction, {
    content: `${interaction.user} unbanned ${user}`,
  }), util.tags.unban, global).catch(() => {});
});