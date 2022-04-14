import mongoose from 'mongoose';

const nickname = new mongoose.Schema({
  user_id: String,
  nickname: String,
});

export default mongoose.model('Nickname', nickname);