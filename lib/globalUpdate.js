import telemetry from './telemetry.js';
import * as util from './util.js';

export default class GlobalUpdate {
  constructor(doc, data) {
    this.timestamp = Date.now();
    this.doc = doc;
    this.data = data;
  }

  async run(channel) {
    channel.webhooks ??= await channel.fetchWebhooks().catch(() => {});
    if (!channel.webhooks) return;
    const hook = channel.webhooks.find(h => h.owner.id == channel.client.user.id) || await channel.createWebhook('TCN global');

    const mirror = util.mirror(this.doc, channel);

    mirror && await hook.editMessage(mirror.message, this.data(channel)).catch(() => {});
    telemetry.push({ type: 'dl', value: Date.now() - this.timestamp });
  }
}


