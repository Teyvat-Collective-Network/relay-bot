import { PermissionFlagsBits } from '@aroleaf/djs-bot';
import * as util from '../lib/util.js';

export default class GlobalCreate {
  constructor(doc, data) {
    this.doc = doc;
    this.data = data;
  }

  async run(channel) {
    const missingPermissions = channel.permissionsFor(channel.guild.members.me).missing([
      PermissionFlagsBits.ViewChannel,
      PermissionFlagsBits.ReadMessageHistory,
      PermissionFlagsBits.ManageWebhooks,
      PermissionFlagsBits.SendMessages,
      PermissionFlagsBits.ManageMessages,
    ]);

    if (missingPermissions.length) return console.log(`missing permissions in ${channel.id} (${channel.guild.name}): ${missingPermissions.join(', ')}`);
    
    const hook = await util.ensureWebhook(channel);
    if (!hook) return;
    
    const msg = await hook.send(this.data(channel)).catch(() => {});
    return msg && this.doc.updateOne({ $push: { mirrors: { channel: channel.id, message: msg.id } } });
  }
}