export default class GlobalCreate {
  constructor(doc, data) {
    this.doc = doc;
    this.data = data;
  }

  async run(channel) {
    channel.webhooks ??= await channel.fetchWebhooks().catch(() => {});
    if (!channel.webhooks) return;
    const hook = channel.webhooks.find(h => h.owner.id == channel.client.user.id) || await channel.createWebhook('TCN global');

    const msg = await hook.send(this.data(channel)).catch(() => {});
    return msg && await this.doc.updateOne({ $push: { mirrors: { channel: channel.id, message: msg.id } } });
  }
}