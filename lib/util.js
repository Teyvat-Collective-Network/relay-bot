import fetch from 'node-fetch';

const regex = {
  invite: /(https?:\/\/)?((discord\.com?|watchanimeattheoffice\.com)\/invite|discord.gg)\/[^\s\/]+/gi,
  files: /^(image|video|audio)\//,
  links: /(?<!\\)((?:\\\\)*)([\[\]\(\)])/,
};


export function cleanObject(obj) {
  const out = {};
  for (const key in obj) {
    const val = obj[key];
    if (val && val.length !== 0) out[key] = val;
  }
  return out;
}


export async function original(client, mirror) {
  return mirror && await client.channels.resolve(mirror.original.channel)?.messages.fetch(mirror.original.message).catch(() => {});
}

export function mirror(doc, channel) {
  return doc.original.channel == channel.id ? doc.original : doc.mirrors.find(m => m.channel == channel.id);
}


export function constructUser(message) {
  const avatarOptions = {
    dynamic: true,
    size: 128,
  };

  return {
    username: `${message.member.displayName||message.author.username} from ${message.guild.name}`,
    avatarURL: message.member.displayAvatarURL(avatarOptions) || message.author.displayAvatarURL(avatarOptions),
  };
}


export async function constructMessage(message, doc) {
  const content = message.content
    ?.replace(regex.invite, '<invite removed>')
    .replace(regex.links, '$1\\$2');

  const embeds = message.embeds?.filter(e=>e.type==='rich');

  const files = message.attachments ? await Promise.all(
    Array.from(message.attachments.values())
      .filter(a => regex.files.test(a.contentType))
      .map(async a => ({ attachment: await fetch(a.url).then(async res => Buffer.from(await res.arrayBuffer())), name: a.name }))
  ) : [];

  const stickers = message.stickers ? await Promise.all(
    Array.from(message.stickers.values())
      .filter(s => s.format != 'LOTTIE')
      .map(s => message.client.stickerCache.fetch(s))
  ): [];

  const user = constructUser(message);

  const reply = doc && await original(message.client, doc);

  return (channel) => {
    const data = cleanObject({
      content: reply 
        ? `**${reply.member?.displayName||reply.author.username}** from **${reply.guild.name}**: [original message](https://discord.com/channels/${channel.guild.id}/${channel.id}/${mirror(doc, channel)})\n<:reply:918825589434097735>${content||''}`
        : message.type === 'REPLY' ? `**[Original Not Found]**\n<:reply:918825589434097735>${content||''}` : content,
      files: stickers.concat(files).slice(0, 10),
      allowedMentions: { parse: [] },
      embeds, ...user,
    });

    return (
      data.content ||
      data.files ||
      data.embeds
    ) && data;
  }
}