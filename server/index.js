const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const app = express();
const server = http.createServer(app); // wrap express with http

const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:3002',
      'https://shopmate-snowy.vercel.app/' // ← add your Vercel URL later
    ],
    methods: ["GET", "POST"],
  },
});

app.use(cors({
  origin: [
    'http://localhost:3002',
    'https://shopmate-snowy.vercel.app/' // ← add your Vercel URL later
  ]
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
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/admin", adminRoutes);

// Root
app.get("/", (req, res) => {
  res.json({ message: "ShopMate API is running! 🚀" });
});

// Socket.io — Live Chat
const activeUsers = {};

// Socket.io — Live Chat
const rooms = {}; // track all customer rooms

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Customer joins their private room
  socket.on("customer_join", (userData) => {
    if (userData.role === "admin") return;

    const roomId = `room_${userData.userId}`;
    socket.join(roomId);
    socket.roomId = roomId;
    socket.userData = userData;

    if (!rooms[roomId]) {
      rooms[roomId] = {
        roomId, // ← make sure roomId is stored
        userId: userData.userId,
        userName: userData.userName,
        messages: [],
      };
    }

    socket.to("admin_room").emit("customer_connected", {
      roomId,
      userId: userData.userId,
      userName: userData.userName,
    });
  });

  // Admin joins admin room
  socket.on("admin_join", (adminData) => {
    socket.join("admin_room");
    socket.isAdmin = true;
    socket.adminData = adminData;
    console.log(`Admin ${adminData.name} joined`);

    // Send all active rooms to admin
    socket.emit("active_rooms", Object.values(rooms));
  });

  // Customer sends message
  socket.on("customer_message", (data) => {
    const message = {
      id: Date.now(),
      sender: "customer",
      senderName: data.userName,
      text: data.text,
      time: new Date().toLocaleTimeString(),
    };

    // Save to room history
    if (rooms[data.roomId]) {
      rooms[data.roomId].messages.push(message);
    }

    // Send to customer's room
    io.to(data.roomId).emit("new_message", message);
    // Send to admin
    io.to("admin_room").emit("new_message_admin", {
      roomId: data.roomId,
      userName: data.userName,
      message,
    });
  });

  // Admin sends message to specific customer
  socket.on("admin_message", (data) => {
    const message = {
      id: Date.now(),
      sender: "admin",
      senderName: "Support",
      text: data.text,
      time: new Date().toLocaleTimeString(),
    };

    // Save to room history
    if (rooms[data.roomId]) {
      rooms[data.roomId].messages.push(message);
    }

    // Send to specific customer room
    io.to(data.roomId).emit("new_message", message);
    // Echo to admin
    io.to("admin_room").emit("new_message_admin", {
      roomId: data.roomId,
      message,
    });
  });

  // Admin requests chat history for a room
  socket.on("get_room_messages", (roomId) => {
    const messages = rooms[roomId]?.messages || [];
    socket.emit("room_messages", { roomId, messages });
  });

  socket.on("disconnect", () => {
    if (socket.roomId && rooms[socket.roomId]) {
      io.to("admin_room").emit("customer_disconnected", {
        roomId: socket.roomId,
      });
    }
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
