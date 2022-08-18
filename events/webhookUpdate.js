import DJS from '@aroleaf/djs-bot';

export default new DJS.Event({
  event: DJS.Events.WebhooksUpdate,
}, async channel => {
  channel.webhooks = await channel.fetchWebhooks();
});