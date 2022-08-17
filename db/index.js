import mongoose from 'mongoose';
import Global from './global.js';
import Message from './message.js';
import Log from './log.js';
import User from './user.js';


export async function message(msg) {
  const id = msg?.id || msg;
  return id && Message.findOne({ $or: [ { 'original.message': id }, { 'mirrors.message': id } ] });
}

export async function messages(msgs) {
  const ids = msgs?.map(msg => msg.id || msg).filter(m => m);
  return ids && Message.find({ $or: [ { 'original.message': ids }, { 'mirrors.message': ids } ] });
}

export async function user(user) {
  const id = user?.id || user;
  return id && User.findOne({ user: user.id });
}

export async function reference(msg) {
  const id = msg?.reference?.messageId;
  return id && message(id);
}

export async function global(name) {
  return name && Global.findOne({ name });
}

export async function subscription(channel) {
  const id = channel?.id || channel;
  return id && Global.findOne({ subscriptions: id });
}

export async function panic(global) {
  const name = global?.name || global;
  return global && Global.updateOne({ name }, { panic: true });
}

export async function unpanic(global) {
  const name = global?.name || global;
  return global && Global.updateOne({ name }, { panic: false });
}

export async function logs(timestamp = 0) {
  return Log.find({ t: { $lt: timestamp } });
}


await mongoose.connect(process.env.MONGO);

export { Global, Message, User, Log };