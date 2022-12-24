import * as util from './util.js';

export default class GlobalBulkDelete {
  constructor(docs) {
    this.docs = docs;
  }

  async run(channel) {
    const messages = this.docs.map(doc => util.mirror(doc, channel)?.message).filter(m => m);
    return channel.bulkDelete(messages, true).catch(() => {});
  }
}