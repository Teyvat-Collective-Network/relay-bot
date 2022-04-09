import mongoose from 'mongoose';

const global = new mongoose.Schema({
  name: String,
  logs: String,
  subscriptions: [String],
  bans: [String],
});

export default mongoose.model('Global', global);