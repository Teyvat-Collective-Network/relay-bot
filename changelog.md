# TCN global relay bot changelog

Updates to the scam link list won't be explicitely versioned. The current scam link count is `13739`.


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