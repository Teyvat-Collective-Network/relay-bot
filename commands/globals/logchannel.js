import Parent from './index.js';
import * as autocomplete from '../../lib/autocomplete.js';
import * as util from '../../lib/util.js';

Parent.subcommand({
  name: 'logchannel',
  description: 'changes the logs channel of a global channel',
  options: [{
    type: 3,
    name: 'name',
    description: 'the name of the global channel you want to change to log channel of',
    required: true,
    autocomplete: true,
    onAutocomplete: autocomplete.global,
  }, {
    type: 7,
    channel_types: [0],
    name: 'logchannel',
    description: 'the channel you want this global channel to log to',
    required: true,
  }],
}, async interaction => {
  const reply = content => interaction.reply({ content, ephemeral: true });

  const tcnData = await util.getTCNData(interaction);
  if (!tcnData.observer) return reply('Sorry, only TCN execs can do that');
  
  const global = await interaction.client.db.Global.findOne({ name: interaction.options.getString('name') });
  if (!global) return reply('Sorry, that is not a global channel');

  const channel = interaction.options.getChannel('logchannel');
  await global.updateOne({ logs: channel.id });
  await reply(`logs channel for ${global.name} changed to ${channel}`);

  util.log(util.fakeMessage(interaction, {
    content: `${interaction.user} changed the log channel to ${channel}`,
  }), util.tags.edit, global).catch(() => {});
});