import telemetry from './telemetry.js';
import * as util from './util.js';

export default class GlobalBulkDelete {
  constructor(docs) {
    this.timestamp = Date.now();
    this.docs = docs;
  }

  async run(channel) {
    const messages = this.docs.map(doc => util.mirror(doc, channel)?.message);
    await channel.bulkDelete(messages, true).catch(() => {});
    telemetry.push({ type: 'dl', value: Date.now() - this.timestamp });
  }
}