import telemetry from './telemetry.js';
import * as util from './util.js';

export default class GlobalDelete {
  constructor(doc) {
    this.timestamp = Date.now();
    this.doc = doc;
  } 

  async run(channel) {
    const msg = util.mirror(this.doc, channel);
    msg && await channel.messages.delete(msg.message).catch(()=>{});
    telemetry.push({ type: 'dl', value: Date.now() - this.timestamp });
  }
}