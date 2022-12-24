import { PermissionFlagsBits } from '@aroleaf/djs-bot';
import * as util from '../lib/util.js';

export default class GlobalCreate {
  constructor(doc, data) {
    this.doc = doc;
    this.data = data;
  }

  async run(channel) {
    if (!channel.permissionsFor(channel.guild.members.me).has([
      PermissionFlagsBits.ViewChannel,
      PermissionFlagsBits.ReadMessageHistory,
      PermissionFlagsBits.ManageWebhooks,
      PermissionFlagsBits.SendMessages,
      PermissionFlagsBits.ManageMessages,
    ])) return console.log(`missing permissions in ${channel.id} (${channel.guild.name})`);
    
    const hook = await util.ensureWebhook(channel);
    if (!hook) return;
    
    const msg = await hook.send(this.data(channel)).catch(() => {});
    return msg && this.doc.updateOne({ $push: { mirrors: { channel: channel.id, message: msg.id } } });
  }
}