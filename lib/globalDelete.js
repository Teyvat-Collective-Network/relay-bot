import * as util from './util.js';

export default class GlobalDelete {
  constructor(doc) {
    this.doc = doc;
  } 

  async run(channel) {
    const msg = util.mirror(this.doc, channel);
    return msg && channel.messages.delete(msg.message).catch(()=>{});
  }
}