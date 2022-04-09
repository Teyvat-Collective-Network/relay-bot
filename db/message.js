import mongoose from 'mongoose';

const SentMessage = {
  channel: String,
  message: String,
};

const message = new mongoose.Schema({
  author: String,
  purged: Boolean,
  original: SentMessage,
  mirrors: [SentMessage],
});

export default mongoose.model('Message', message);