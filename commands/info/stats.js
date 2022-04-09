import { SlashCommand } from '@aroleaf/djs-bot';
import clui from 'clui';

import telemetry from '../../lib/telemetry.js';

const spark = clui.Sparkline;

export default new SlashCommand({
  name: 'stats',
  description: 'bot stats'
}, interaction => {
  interaction.reply({
    content: '```ansi\n' + `req: ${spark(telemetry.history.r, 'req/sec')}\nrlm: ${spark(telemetry.history.l, 'req/sec')}\ndly: ${spark(telemetry.history.d, 'ms')}` + '\n```',
    ephemeral: true,
  });
});