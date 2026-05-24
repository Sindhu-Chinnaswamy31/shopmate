const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: String, enum: ['customer', 'admin'], required: true },
  senderName: String,
  text: String,
  time: String
}, { timestamps: true });

const chatRoomSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  userName: { type: String, required: true },
  roomId: { type: String, required: true, unique: true },
  messages: [messageSchema],
  isActive: { type: Boolean, default: true },
  lastMessage: { type: String, default: '' },
  lastMessageTime: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('ChatRoom', chatRoomSchema);