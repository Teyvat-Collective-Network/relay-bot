import mongoose from 'mongoose';

const log = new mongoose.Schema({
  t: Number,
  r: Number,
  l: Number,
  d: Number,
});

export default mongoose.model('Log', log);