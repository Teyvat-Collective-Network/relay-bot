# TCN global relay bot changelog

Updates to the scam link list won't be explicitely versioned. The current scam link count is `15260`.

## 1.9.3

use autocomplete instead of modal for `/connect`

## 1.9.2

Threads AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA.

## 1.9.1

Re-enabled webhook messages being relayed for bot webhooks. This should make NQN work again.

## 1.9

Added `/json-doc` to get the JSON of documents the global bot uses. 

## 1.8.5

edits were completely broken

## 1.8.4

1.8.2 did *not* fix embeds not showing up, this update does.

## 1.8.3 "Parasite"

Hotfix for a bug where external emotes do not show up using bot-owned webhooks.
This update requires staff on each connected server to create a user-owned webhook so the global chat can keep supporting external emojis.

## 1.8.2

- Fixes embeds not showing up
- Should make embed edits more stable

## 1.8.1

Fixes a bug where replies don't have any reply info, and instead look like non-reply messages.

## 1.8

### Discord.js 14
The framework used to make this bot was updated to use Discord.js 14, so there may be an increased amount of bugs this version.

### Sticker fallback
0 byte stickers are a thing of the past! There is now a fallback image in case a sticker could not be found or converted.

## 1.7

### Panic mode
Adds two new commands:
- `/panic`: enables panic mode for a global channel
- `/unpanic`: disables panic mode for a global channel
Panic mode instantly disables most interactions with the global channel panic mode is activated for. This can be useful in case of a raid or similar event.
Panic mode can be switched on by anyone with MANAGE_MESSAGES permissions, but can only be switched off by TCN observers.

## 1.6

### webhooks
- webhook messages not sent by the global bot are now relayed. this makes NQN work
- the bot will also detect that a message might get deleted by NQN, and delay the relay operation, to not send unnecessary messages.

### stickers
- lottie stickers (the default nitro stickers) will now be relayed

### moderation
- messages blocked by the word filter will now be logged


## 1.5

- added `/rules`: show the global chat's rules
- improved scamlink regex


## 1.4

### new commands
- `/partners`: sends the TCN partner embed
- `/nickname`: allows you to set a global nickname that shows up on all your global messages

### other changes
- server names are now fetched from the TCN API, instead of Discord, so they won't contain all the "| Genshin Impact" bloat, making them shorter.
- exec/observer checks should be slightly faster. (not like they were slow but still)


## 1.3

### new commands
- `/faq`: shows some frequently asked questions about the global chat
- `/help`: detailed help pages on how to use the global bot

### other changes
this update is a total internal rewrite with many potential insignificant changes


## 1.2
- stickers resized to 160x160
- no need to specify the global chat name for ban/unban
- filtered messages and messages from banned users now get deleted from the source server too
- you can't ban yourself, and you can't ban people when banned
- APNG type animated stickers now work (lottie stickers probably won't for a while)


## 1.1

### filter:
- 8732 scam links
- NSFW terms
- slurs
- other offensive terms


## 1.0

### general:
- editing messages works now

### replies:
- replies are not an embed
- replies link to the message in their channel instead of showing the original message content
- chains of multiple replies don't break

### media:
- discord cdn links aren't flagged as invites anymore
- embedded links show as they would on any message, not as embed thumbnail
- attachements work (filters out anything not audio, video, or image)
- stickers work (only static png stickers work right now, I'm working on fixing that)

### moderation:
- deleting a message purges it
- command to grab author's userid (right click message → apps → userid)