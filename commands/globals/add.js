import Parent from './index.js';
import * as util from '../../lib/util.js';

Parent.subcommand({
  name: 'add',
  description: 'add a global channel',
  options: [{
    type: 3,
    name: 'name',
    description: 'the name of the new global channel',
    required: true,
  }, {
    type: 7,
    channel_types: [0],
    name: 'logchannel',
    description: 'the channel you want this global channel to log to',
  }],
}, async interaction => {
  const reply = content => interaction.reply({ content, ephemeral: true });

  const tcnData = await util.getTCNData(interaction);
  if (!tcnData.observer) return reply('Sorry, only TCN execs can create new global channels.');

  const name = interaction.options.getString('name');
  if (await interaction.client.db.Global.exists({ name })) return reply('A global channel with that name already exists.');
  await interaction.client.db.Global.create({ name, logs: interaction.options.getChannel('logchannel')?.id });
  await reply(`global channel ${name} created!`);

  util.log(util.fakeMessage(interaction, {
    content: `${interaction.user} created **${name}**`,
  }), util.tags.create).catch(() => {});
});