import * as util from '../lib/util.js';

export default class GlobalCreate {
  constructor(doc, data) {
    this.doc = doc;
    this.data = data;
  }

  async run(channel) {
    const hook = await util.ensureWebhook(channel);
    if (!hook) return;
    const msg = await hook.send(this.data(channel)).catch(() => {});
    return msg && this.doc.updateOne({ $push: { mirrors: { channel: channel.id, message: msg.id } } });
  }
}