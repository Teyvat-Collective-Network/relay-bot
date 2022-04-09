import { update, config } from '@aroleaf/djs-bot';
import { Log } from '../db/index.js';
import clui from 'clui';

config.level = 3;
const spark = clui.Sparkline;

const items = [];
const history = { l:[0], r:[0], d:[0] };

let now = Date.now();

function tick() {
  return now += 1000;
}

function log() {
  const { rl, rq, dl } = items.reduce((a,v) => { a[v.type].push(v.value); return a }, { rl: [], rq: [], dl: [] });
  items.length = 0;

  const [l,r,d] = [rl.length, rq.length, Math.max(0, ...dl)];
  history.r.push(r);
  history.l.push(l);
  history.d.push(d);

  history.r = history.r.slice(-30);
  history.l = history.l.slice(-30);
  history.d = history.d.slice(-30);

  if (l||r||d) Log.create({
    t: now,
    r,l,d,
  });

  update(`req: ${spark(history.r, 'req/sec')}\nrlm: ${spark(history.l, 'req/sec')}\ndly: ${spark(history.d, 'ms')}`);

  setTimeout(log, tick() - Date.now());
}

export default { start: log, push: (...args) => items.push(...args), history };