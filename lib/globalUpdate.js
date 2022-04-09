import * as util from './util.js';

export default class GlobalUpdateOperation {
  constructor(doc, data) {
    this.timestamp = Date.now();
    this.doc = doc;
    this.data = data;
  }

  async run(channel) {2
    if (!channel.webhooks) channel.webhooks = await channel.fetchWebhooks().catch(() => {});
    if (!channel.webhooks) return;
    const hook = channel.webhooks.find(h => h.owner.id == channel.client.user.id) || await channel.createWebhook('TCN global');

    const mirror = util.mirror(channel);

    mirror && await hook.editMessage(mirror.message, this.data(channel)).catch(() => {});
    // add time taken
  }
}