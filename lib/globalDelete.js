import * as util from './util.js';

export default class GlobalDeleteOperation {
  constructor(doc) {
    this.timestamp = Date.now();
    this.doc = doc;
  } 

  async run(channel) {
    const msg = util.mirror(this.doc, channel);
    return msg && channel.messages.delete(msg.message).catch(()=>{});
    // log time taken
  }
}