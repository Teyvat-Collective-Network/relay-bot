import DJS from '@aroleaf/djs-bot';

const regex = {
  invite: /(https?:\/\/)?((discord\.com?|watchanimeattheoffice\.com)\/invite|discord\.gg)\/[^\s\/]+/gi,
  files: /^(image|video|audio)\//,
  code: /(`[^`]+?`|``(?:[^`]`[^`]|[^`])+?``|```(?:[^`]``[^`]|[^`])+?```)/,
  links: /(?<!\\)((?:\\\\)*)([\[\]\(\)])/g,
};


const deletedMessages = new Set();

export function isDeletedMessage(message) {
	return deletedMessages.has(message.id || message);
}
export function markDeletedMessage(message) {
	deletedMessages.add(message.id || message);
}


export function cleanObject(obj) {
  const out = {};
  for (const key in obj) {
    const val = obj[key];
    if (val && val.length !== 0) out[key] = val;
  }
  return out;
}


export async function ensureWebhook(channel, id) {
  if (!channel?.fetchWebhooks) return;
  channel.webhooks ??= await channel.fetchWebhooks().catch(() => {});
  if (!channel.webhooks) return;
  if (id) return channel.webhooks.get(id);
  return channel.webhooks.find(h => !h.owner.bot && h.token) 
    || channel.webhooks.find(h => h.owner.id === channel.client.user.id) 
    || await channel.createWebhook({ name: 'TCN global' });
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

  const { guild } = await getTCNData(message);
  const user = await message.client.db.user(message.author);

  return {
    username: `${user?.nickname || message.member?.displayName || message.author?.username} from ${guild?.name || message.guild?.name}`,
    mdName: `**${user?.nickname || message.member?.displayName || message.author?.username}** from **${guild?.name || message.guild?.name}**`,
    avatarURL: message.member?.displayAvatarURL(avatarOptions) || message.author?.displayAvatarURL(avatarOptions),
  };
}


export async function constructMessage(message, replyDoc) {
  const content = message.content
    ?.replace(regex.invite, '<invite removed>')
    .split(regex.code)
    .map((part, i) => i%2 ? part : part.replace(regex.links, '$1\\$2'))
    .join('');

  const embeds = message.embeds?.filter(e => e.data.type === 'rich');

  const files = message.attachments ? await Promise.all(
    Array.from(message.attachments.values())
      .filter(a => regex.files.test(a.contentType))
      .map(async a => ({ attachment: await fetch(a.url).then(async res => Buffer.from(await res.arrayBuffer())), name: a.name }))
  ) : message.files || [];

  const stickers = message.stickers ? await Promise.all(
    Array.from(message.stickers.values())
      .map(async s => ({ attachment: await message.client.stickerCache.fetch(s), name: `${s.name}.${message.client.stickerCache.ext(s)}` }))
  ): [];

  const user = await constructUser(message);

  const replyMsg = replyDoc && await original(message.client, replyDoc);
  const replyUser = replyMsg && await constructUser(replyMsg);

  return (channel) => {
    const replyMirror = replyDoc && channel && mirror(replyDoc, channel);

    const reply = message.type === DJS.MessageType.Reply && {
      author: replyMsg ?  replyUser.mdName : '**[Original Not Found]**',
      link: replyMirror ? `[original message](https://discord.com/channels/${channel.guild.id}/${channel.id}/${replyMirror.message})` : '',
      content: content || '',
    };

    const data = cleanObject({
      content: (reply ? `${reply.author}: ${reply.link}\n<:reply:918825589434097735> ${reply.content}` : content)?.slice(0, 2000),
      files: stickers.concat(files).slice(0, 10),
      allowedMentions: { parse: [] },
      flags: message.flags & 1<<2,
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
  message.author ||= message.member?.user || source.client.user;
  return message;
}


export const tags = {
  ban:        '<:l:957351180609150976><:r:957351180068061204>',
  unban:      '<:l:957351179770265600><:r:957351179774480474>',
  edit:       '<:l:957351180026126407><:r:957351179979984976>',
  purge:      '<:l:957351179661230112><:r:957351180009345104>',
  bulk:       '<:l:957351179988385862><:r:957351180034519161>',
  connect:    '<:l:957351179950649434><:m:957351179392802928><:r:957351179774464030>',
  disconnect: '<:l:957351179979993168><:m:957351180281982996><:r:957351180080656455>',
  create:     '<:l:957351180013568180><:r:957351179992571954>',
  delete:     '<:l:957351180034506792><:r:957351180621738014>',
  blocked:    '<:l:1002593077984251955><:r:1002593076738535605>',
}

export async function log(message, tag = '', global = {}) {
  const channel = message.client.channels.resolve(global.logs || process.env.LOGS);
  const hook = await ensureWebhook(channel);
  if (!hook) return;
  
  const data = (await constructMessage(message))(channel);
  if (!data) return;
  
  data.content = `[](http://tc.n '${message.member?.id||message.author?.id||''}')${tag} ${global.name?`**[${global.name}]**`:''} ${message.content}`.slice(0,2000);

  await hook.send(data).catch(() => {});
}


export async function getTCNData(interaction) {
  const user_id = interaction.user?.id || interaction.author?.id;
  const [ guild, user ] = await Promise.all([
    interaction.client.tcn.fetchGuild(interaction.options?.getString('server', false) || interaction.guildId).catch(() => {}),
    interaction.client.tcn.fetchUser(user_id).catch(() => {}),
  ]);
  return {
    guild,
    user,
    observer: user?.roles.includes('observer'),
    owner: guild?.owner === user_id,
    advisor: guild?.advisor === user_id,
    voter: guild?.voter === user_id,
  }
}


export async function purgeMessage(doc, client) {
  const res = {
    count: 0,
    failed: [],
  }
  
  if (!doc.purged) await doc.updateOne({ purged: true });

  for (const { channel: channelId, message: messageId } of doc.mirrors.concat(doc.original)) {
    const message = await client.channels.resolve(channelId)?.messages.fetch(messageId).catch(() => {});
    if (message) await message.delete().then(() => res.count++).catch(() => res.failed.push(message.guild));
  }

  return res;
}

export async function bulkPurgeMessages(docs, client) {
  const res = {
    count: 0,
    failed: [],
  }

  await client.db.Message.updateMany({ _id: { $in: docs.map(doc => doc._id) } }, { purged: true });

  const channels = {};
  for (const { channel, message } of [...new Set(docs.flatMap(doc => doc.mirrors.concat(doc.original)))]) {
    (channels[channel] ??= []).push(message); 
  }

  for (const [channelId, messages] of Object.entries(channels)) {
    const channel = client.channels.resolve(channelId);
    if (channel) await channel.bulkDelete(messages, true).then(() => res.count += messages.length).catch(() => res.failed.push(channel.guild));
  }

  return res;
}