import * as util from './util.js';

export default class GlobalBulkDeleteOperation {
  constructor(docs) {
    this.timestamp = Date.now();
    this.docs = docs;
  }

  async run(channel) {
    const messages = this.docs.map(doc => util.mirror(doc, channel)?.message);
    return channel.bulkDelete(messages, true).catch(() => {});
    // log time taken
  }
}