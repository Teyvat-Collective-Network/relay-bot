import mongoose from 'mongoose';

const user = new mongoose.Schema({
  user: String,
  nickname: String,
});

export default mongoose.model('User', user);