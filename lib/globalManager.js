export default class GlobalManager {
  constructor(channel) {
    this.channel = channel;
    this.queue = [];
  }

  push(action) {
    this.queue.push(action);
    if (this.queue.length === 1) this.empty();
  }

  async empty() {
    while(this.queue.length) {
      const action = this.queue[0];
      await action.run(this.channel);
      this.queue.shift();
    }
  }
}