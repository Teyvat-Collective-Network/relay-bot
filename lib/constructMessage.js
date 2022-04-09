import fetch from 'node-fetch';

const domainRegex = /(https?:\/\/)?((discord\.com?|watchanimeattheoffice\.com)\/invite|discord.gg)\/[^\s\/]+/gi;
const contentTypeRegex = /^(image|video|audio)\//;
const escapeRegex = /(?<!\\)((?:\\\\)*)([\[\]\(\)])/;

async function constructRaw(message) {
  const data = {};

  if (message.content) data.content = message.content
    .replace(domainRegex, '<invite removed>')
    .replace(escapeRegex, '$1\\$2');
  
  const embeds = message.embeds?.filter(e=>e.type==='rich');
  if (embeds?.length) data.embeds = embeds;

  const files = await Promise.all(
    Array.from(message.attachments?.values()||[])
    .filter(a => contentTypeRegex.test(a.contentType))
    .map(async a => ({ attachment: await fetch(a.url).then(async res => Buffer.from(await res.arrayBuffer())), name: a.name }))
  );
  const stickers = [];
  for (const sticker of Array.from(message.stickers?.values()||[])) {
    const stickerPath = await message.client.stickerCache.fetch(sticker);
    if (stickerPath) stickers.push(stickerPath);
  }

  if (stickers.length || files.length) data.files = stickers.concat(files).slice(0, 10);

  return data;
}


export default async function constructMessage(message) {
  const data = await constructRaw(message);

  data.content = await (async (content) => {
    if (message.type != 'REPLY') return () => content;
    
    const doc = await message.client.db.Message.findOne({ $or: [ { 'original.message': message.reference.messageId }, { 'mirrors.message': message.reference.messageId } ] });
    
    const reply = doc && await message.client.channels.resolve(doc.original.channel)?.messages.fetch(doc.original.message).catch(() => {});
    
    if (!reply) return () => `**[Original Not Found]**\n<:reply:918825589434097735>${content||''}`;
    
    return channel => {
      const msg = doc.original.channel == channel.id ? doc.original.message : doc.mirrors.find(m => m.channel == channel.id)?.message;
      const guild = channel.guild;
      const link = `https://discord.com/channels/${guild.id}/${channel.id}/${msg}`;
      return `**${reply.member?.displayName||reply.author.username}** from **${reply.guild.name}**: [original message](${link})\n<:reply:918825589434097735>${content||''}`;
    }
  })(data.content);

  return data;
}


const tags = {
  ban: '<:banL:957351180609150976><:banR:957351180068061204> ',
  unban: '<:unbanL:957351179770265600><:unbanR:957351179774480474> ',
  edit: '<:editL:957351180026126407><:editR:957351179979984976> ',
  purge: '<:purgeL:957351179661230112><:purgeR:957351180009345104> ',
  bulk: '<:bulkL:957351179988385862><:bulkR:957351180034519161> ',
  connect: '<:connectL:957351179950649434><:connectM:957351179392802928><:connectR:957351179774464030> ',
  disconnect: '<:disconnectL:957351179979993168><:disconnectM:957351180281982996><:disconnectR:957351180080656455> ',
  create: '<:createL:957351180013568180><:createR:957351179992571954> ',
  delete: '<:deleteL:957351180034506792><:deleteR:957351180621738014> ',
}


export async function constructLog(message, type) {
  return {
    ...await constructRaw(message),
    content: `[](http://tc.n '${message.member.id}')${tags[type]} ${message.content}`.slice(0,2000),
    username: `${message.member.displayName} from ${message.guild.name}`,
    avatarURL: message.member.displayAvatarURL({
      dynamic: true,
      size: 128,
    }),
    allowedMentions: { parse: [] },
  };
}