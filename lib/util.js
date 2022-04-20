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


export async function constructUser(message) {
  const avatarOptions = {
    dynamic: true,
    size: 128,
  };

  const user = await message.client.db.user(message.author);
  const guild = message.client.tcn.guilds.get(message.guild.id);

  return {
    username: `${user?.nickname||message.member?.displayName||message.author?.username} from ${guild?.name||message.guild?.name}`,
    mdName: `**${user?.nickname||message.member?.displayName||message.author?.username}** from **${guild?.name||message.guild?.name}**`,
    avatarURL: message.member?.displayAvatarURL(avatarOptions) || message.author?.displayAvatarURL(avatarOptions),
  };
}


export async function constructMessage(message, replyDoc) {
  const content = message.content
    ?.replace(regex.invite, '<invite removed>')
    .replace(regex.links, '$1\\$2');

  const embeds = message.embeds?.filter(e=>e.type==='rich');

  const files = message.attachments ? await Promise.all(
    Array.from(message.attachments.values())
      .filter(a => regex.files.test(a.contentType))
      .map(async a => ({ attachment: await fetch(a.url).then(async res => Buffer.from(await res.arrayBuffer())), name: a.name }))
  ) : message.files || [];

  const stickers = message.stickers ? await Promise.all(
    Array.from(message.stickers.values())
      .filter(s => s.format != 'LOTTIE')
      .map(s => message.client.stickerCache.fetch(s))
  ): [];

  const user = await constructUser(message);

  const replyMsg = replyDoc && await original(message.client, replyDoc);
  const replyUser = replyMsg && await constructUser(replyMsg);

  return (channel) => {
    const replyMirror = replyDoc && channel && mirror(replyDoc, channel);

    const reply = message.type === 'REPLY' && {
      author: replyMsg ?  replyUser.mdName : '**[Original Not Found]**',
      link: replyMirror ? `[original message](https://discord.com/channels/${channel.guild.id}/${channel.id}/${replyMirror.message})` : '',
      content: content || '',
    };

    const data = cleanObject({
      content: (reply ? `${reply.author}: ${reply.link}\n<:reply:918825589434097735>${reply.content}` : content)?.slice(0, 2000),
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


export function fakeMessage(source, message) {
  message.client = source.client;
  message.guild = source.guild;
  message.member ||= source.guild?.me;
  message.user ||= message.member?.user || source.client.user;
  return message;
}


export const tags = {
  ban: '<:banL:957351180609150976><:banR:957351180068061204>',
  unban: '<:unbanL:957351179770265600><:unbanR:957351179774480474>',
  edit: '<:editL:957351180026126407><:editR:957351179979984976>',
  purge: '<:purgeL:957351179661230112><:purgeR:957351180009345104>',
  bulk: '<:bulkL:957351179988385862><:bulkR:957351180034519161>',
  connect: '<:connectL:957351179950649434><:connectM:957351179392802928><:connectR:957351179774464030>',
  disconnect: '<:disconnectL:957351179979993168><:disconnectM:957351180281982996><:disconnectR:957351180080656455>',
  create: '<:createL:957351180013568180><:createR:957351179992571954>',
  delete: '<:deleteL:957351180034506792><:deleteR:957351180621738014>',
}

export async function log(message, tag = '', global = { logs: process.env.LOGS }) {
  const channel = message.client.channels.resolve(global.logs);
  if (!channel) return;
  if (!channel.webhooks) channel.webhooks = await channel.fetchWebhooks().catch(() => {});
  if (!channel.webhooks) return;
  const hook = channel.webhooks.find(h => h.owner.id == channel.client.user.id) || await channel.createWebhook('TCN global');

  const data = (await constructMessage(message))(channel);
  if (!data) return;
  data.content = `[](http://tc.n '${message.member?.id||message.author?.id}')${tag} ${global.name?`**[${global.name}]**`:''} ${message.content}`.slice(0,2000);

  await hook.send(data).catch(() => {});
}
