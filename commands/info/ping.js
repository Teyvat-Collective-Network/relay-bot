import DJS from '@aroleaf/djs-bot';
import { template } from 'discord-markdown-embeds';

const embed = template(`
---
color: 0x207868
---
# Pong!
My ping is {ping}ms
`);

export default new DJS.SlashCommand({
  name: 'ping',
  description: 'pong!',
}, interaction => {
  interaction.reply({
    embeds: embed.render({ commands: { ping: interaction.client.ws.ping } }),
    ephemeral: true,
  });
});