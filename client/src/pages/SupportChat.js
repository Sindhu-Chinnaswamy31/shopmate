import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

let socket;

function SupportChat() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [notifications, setNotifications] = useState({});
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
      return;
    }

    socket = io("http://localhost:8000");

    socket.on("connect", () => {
      socket.emit("admin_join", { name: user.name });
    });

    // Get all active rooms
    socket.on("active_rooms", (activeRooms) => {
      setRooms(activeRooms);
    });

    // New customer connected
    socket.on("customer_connected", (data) => {
      setRooms((prev) => {
        const exists = prev.find((r) => r.userId === data.userId);
        if (exists) return prev;
        return [
          ...prev,
          {
            userId: data.userId,
            userName: data.userName,
            roomId: data.roomId,
            messages: [],
          },
        ];
      });
    });

    // New message from customer
    socket.on("new_message_admin", (data) => {
      if (data.message.sender === "customer") {
        setNotifications((prev) => ({
          ...prev,
          [data.roomId]: (prev[data.roomId] || 0) + 1,
        }));
      }

      setActiveRoom((current) => {
        const currentRoomId = current?.roomId || `room_${current?.userId}`;
        if (current && currentRoomId === data.roomId) {
          setMessages((msgs) => [...msgs, data.message]);
          setNotifications((prev) => ({ ...prev, [data.roomId]: 0 }));
        }
        return current;
      });
    });

    return () => {
      if (socket) socket.disconnect();
    };
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const openRoom = (room) => {
    // Build roomId from userId if not present
    const roomId = room.roomId || `room_${room.userId}`;
    const roomWithId = { ...room, roomId };

    setActiveRoom(roomWithId);
    setNotifications((prev) => ({ ...prev, [roomId]: 0 }));

    socket.emit("get_room_messages", roomId);
    socket.once("room_messages", (data) => {
      if (data.roomId === roomId) {
        setMessages(data.messages);
      }
    });
  };

  const sendMessage = () => {
    if (!message.trim() || !activeRoom) return;
    const roomId = activeRoom.roomId || `room_${activeRoom.userId}`;
    socket.emit("admin_message", {
      roomId,
      text: message,
    });
    setMessage("");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar — Customer List */}
      <div className="w-72 bg-white border-r flex flex-col">
        <div className="p-4 border-b bg-purple-600 text-white">
          <h2 className="font-bold text-lg">🛡️ Support Dashboard</h2>
          <p className="text-purple-200 text-sm">{rooms.length} active chats</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {rooms.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-3xl mb-2">💤</p>
              <p className="text-sm">No active chats</p>
            </div>
          ) : (
            rooms.map((room) => (
              <button
                key={room.roomId || room.userId}
                onClick={() => openRoom(room)}
                className={`w-full p-4 text-left border-b hover:bg-purple-50 transition flex justify-between items-center
                  ${
                    activeRoom?.userId === room.userId
                      ? "bg-purple-50 border-l-4 border-l-purple-600"
                      : ""
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    {room.userName?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">
                      {room.userName}
                    </p>
                    <p className="text-xs text-green-500">🟢 Online</p>
                  </div>
                </div>
                {notifications[room.roomId] > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {notifications[room.roomId]}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
        <div className="p-4 border-t">
          <button
            onClick={() => navigate("/admin")}
            className="w-full text-gray-500 hover:text-purple-600 text-sm transition"
          >
            ← Back to Admin Panel
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeRoom ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b px-6 py-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                {activeRoom.userName?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-gray-800">{activeRoom.userName}</p>
                <p className="text-xs text-green-500">🟢 Active now</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-3">
              {messages.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <p className="text-3xl mb-2">💬</p>
                  <p>No messages yet</p>
                </div>
              )}
              {messages.map((msg, index) => {
                const isAdmin = msg.sender === "admin"; // ✅ admin messages on RIGHT
                return (
                  <div
                    key={index}
                    className={`flex flex-col ${
                      isAdmin ? "items-end" : "items-start"
                    }`}
                  >
                    <span className="text-xs text-gray-400 mb-1">
                      {isAdmin ? "🛡️ You (Support)" : `👤 ${msg.senderName}`} ·{" "}
                      {msg.time}
                    </span>
                    <div
                      className={`px-4 py-2 rounded-2xl max-w-md text-sm
        ${
          isAdmin
            ? "bg-purple-600 text-white rounded-br-none"
            : "bg-white text-gray-800 rounded-bl-none shadow"
        }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="bg-white border-t p-4 flex gap-3">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                placeholder={`Reply to ${activeRoom.userName}...`}
                className="flex-1 border border-gray-300 rounded-full px-5 py-3
                  focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <button
                onClick={sendMessage}
                className="bg-purple-600 text-white rounded-full px-6 py-3
                  hover:bg-purple-700 transition font-semibold"
              >
                Send ➤
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <p className="text-5xl mb-4">💬</p>
              <p className="text-xl font-semibold">Select a chat to start</p>
              <p className="text-sm mt-2">
                Choose a customer from the left panel
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SupportChat;
