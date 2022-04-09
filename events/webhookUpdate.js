import { Event } from '@aroleaf/djs-bot';

export default new Event({
  event: 'webhookUpdate',
}, async channel => {
  channel.webhooks = await channel.fetchWebhooks();
});