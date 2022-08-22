import * as util from './util.js';

export default class GlobalUpdate {
  constructor(doc, data) {
    this.doc = doc;
    this.data = data;
  }

  async run(channel) {
    const hook = await util.ensureWebhook(channel);
    const mirror = util.mirror(this.doc, channel);
    if (!hook || !mirror) return;
    return hook.editMessage(mirror.message, this.data(channel)).catch(() => {});
  }
}


