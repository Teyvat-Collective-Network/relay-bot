import { Event } from '@aroleaf/djs-bot';
import telemetry from '../lib/telemetry.js';

export default new Event({
  event: 'apiRequest',
}, () => telemetry.push({ type: 'rq' }));