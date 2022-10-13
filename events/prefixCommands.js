import { Bot, Event, Events } from '@aroleaf/djs-bot';

export default new Event({
  event: Events.MessageCreate,
}, Bot.defaultEvents[1].run);