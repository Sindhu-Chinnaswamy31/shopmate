const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();
const ChatRoom = require('./models/ChatRoom');

const app = express();
const server = http.createServer(app); // wrap express with http

const io = new Server(server, {
  cors: {
    // origin: [
    //   'http://localhost:3002',
    //   'https://shopmate-snowy.vercel.app' // ← add your Vercel URL later
    // ],
    origin: '*',
    methods: ["GET", "POST"],
  },
});

app.use(cors({
  origin: [
    'http://localhost:3002',
    'https://shopmate-snowy.vercel.app' // ← add your Vercel URL later
  ],
  credentials: true
}));
app.use(express.json());

// MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected ✅"))
  .catch((err) => console.log("DB Error:", err));

// Routes
const productRoutes = require("./routes/productRoutes");
const authRoutes = require("./routes/authRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const adminRoutes = require("./routes/adminRoutes");
const reviewRoutes = require('./routes/reviewRoutes');
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/admin", adminRoutes);
app.use('/api/reviews', reviewRoutes);

// Root
app.get("/", (req, res) => {
  res.json({ message: "ShopMate API is running! 🚀" });
});

// Socket.io — Live Chat
const activeUsers = {};

// Socket.io — Live Chat
const rooms = {}; // track all customer rooms

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Customer joins
  socket.on('customer_join', async (userData) => {
    if (userData.role === 'admin') return;

    const roomId = `room_${userData.userId}`;
    socket.join(roomId);
    socket.roomId = roomId;
    socket.userData = userData;

    try {
      // Find or create room in DB
      let room = await ChatRoom.findOne({ userId: userData.userId });
      if (!room) {
        room = await ChatRoom.create({
          userId: userData.userId,
          userName: userData.userName,
          roomId,
          messages: []
        });
      } else {
        // Update active status
        await ChatRoom.findOneAndUpdate(
          { userId: userData.userId },
          { isActive: true }
        );
      }

      // Notify admin
      socket.to('admin_room').emit('customer_connected', {
        roomId,
        userId: userData.userId,
        userName: userData.userName
      });

    } catch (err) {
      console.error('customer_join error:', err);
    }
  });

  // Admin joins
  socket.on('admin_join', async (adminData) => {
    socket.join('admin_room');
    socket.isAdmin = true;

    try {
      // Send all active rooms from DB
      const rooms = await ChatRoom.find({ isActive: true })
        .select('userId userName roomId lastMessage lastMessageTime')
        .sort({ lastMessageTime: -1 });
      socket.emit('active_rooms', rooms);
    } catch (err) {
      console.error('admin_join error:', err);
    }
  });

  // Customer sends message
  socket.on('customer_message', async (data) => {
    const message = {
      id: Date.now(),
      sender: 'customer',
      senderName: data.userName,
      text: data.text,
      time: new Date().toLocaleTimeString()
    };

    try {
      // Save to DB
      await ChatRoom.findOneAndUpdate(
        { roomId: data.roomId },
        {
          $push: { messages: message },
          lastMessage: data.text,
          lastMessageTime: new Date()
        }
      );
    } catch (err) {
      console.error('customer_message error:', err);
    }

    io.to(data.roomId).emit('new_message', message);
    io.to('admin_room').emit('new_message_admin', {
      roomId: data.roomId,
      userName: data.userName,
      message
    });
  });

  // Admin sends message
  socket.on('admin_message', async (data) => {
    const message = {
      id: Date.now(),
      sender: 'admin',
      senderName: 'Support',
      text: data.text,
      time: new Date().toLocaleTimeString()
    };

    try {
      await ChatRoom.findOneAndUpdate(
        { roomId: data.roomId },
        {
          $push: { messages: message },
          lastMessage: `Support: ${data.text}`,
          lastMessageTime: new Date()
        }
      );
    } catch (err) {
      console.error('admin_message error:', err);
    }

    io.to(data.roomId).emit('new_message', message);
    io.to('admin_room').emit('new_message_admin', {
      roomId: data.roomId,
      message
    });
  });

  // Get room messages
  socket.on('get_room_messages', async (roomId) => {
    try {
      const room = await ChatRoom.findOne({ roomId });
      const messages = room ? room.messages : [];
      socket.emit('room_messages', { roomId, messages });
    } catch (err) {
      socket.emit('room_messages', { roomId, messages: [] });
    }
  });

  // Load previous messages for customer
  socket.on('get_my_messages', async (userId) => {
    try {
      const room = await ChatRoom.findOne({ userId });
      const messages = room ? room.messages : [];
      socket.emit('my_messages', messages);
    } catch (err) {
      socket.emit('my_messages', []);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
