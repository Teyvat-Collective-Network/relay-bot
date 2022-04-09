export default class GlobalCreate {
  constructor(doc, data) {
    this.timestamp = Date.now();
    this.doc = doc;
    this.data = data;
  }

  async run(channel) {
    if (!channel.webhooks) channel.webhooks = await channel.fetchWebhooks().catch(() => {});
    if (!channel.webhooks) return;
    const hook = channel.webhooks.find(h => h.owner.id == channel.client.user.id) || await channel.createWebhook('TCN global');

    const msg = await hook.send(this.data(channel)).catch(() => {});
    // add time taken
    return msg && await this.doc.updateOne({ $push: { mirrors: { channel: channel.id, message: msg.id } } });
  }
}