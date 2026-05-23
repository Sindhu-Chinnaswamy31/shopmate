import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../context/AuthContext";

let socket;

function LiveChat() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);
  const messagesEndRef = useRef(null);
  const SOCKET_URL =
    process.env.REACT_APP_SOCKET_URL || "http://localhost:8000";

  useEffect(() => {
    if (!user) return;

    socket = io(SOCKET_URL);

    socket.on("connect", () => {
      setConnected(true);
      // Join private room
      socket.emit("customer_join", {
        userId: user.id,
        userName: user.name,
        role: user.role,
      });
    });

    // Receive messages (from admin or own)
    socket.on("new_message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      if (socket) socket.disconnect();
    };
  }, [SOCKET_URL]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!message.trim() || !user) return;
    socket.emit("customer_message", {
      roomId: `room_${user.id}`,
      userName: user.name,
      text: message,
    });
    setMessage("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  if (!user || user.role === "admin") return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl w-80 h-96 flex flex-col mb-4 border border-gray-200">
          {/* Header */}
          <div className="bg-purple-600 text-white px-4 py-3 rounded-t-2xl flex justify-between items-center">
            <div>
              <p className="font-bold">💬 Support Chat</p>
              <p className="text-xs text-purple-200">
                {connected ? "🟢 Online" : "🔴 Connecting..."}
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200 text-xl"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
            {messages.length === 0 && (
              <div className="text-center mt-8">
                <p className="text-3xl mb-2">👋</p>
                <p className="text-gray-500 text-sm">Hi {user.name}!</p>
                <p className="text-gray-400 text-xs mt-1">
                  How can we help you today?
                </p>
              </div>
            )}
            {messages.map((msg, index) => {
              const isMe = msg.sender === "customer";
              return (
                <div
                  key={index}
                  className={`flex flex-col ${
                    isMe ? "items-end" : "items-start"
                  }`}
                >
                  <span className="text-xs text-gray-400 mb-1">
                    {isMe ? "You" : "🛡️ Support"} · {msg.time}
                  </span>
                  <div
                    className={`px-3 py-2 rounded-2xl max-w-xs text-sm
                    ${
                      isMe
                        ? "bg-purple-600 text-white rounded-br-none"
                        : "bg-gray-100 text-gray-800 rounded-bl-none"
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
          <div className="p-3 border-t flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm
                focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            <button
              onClick={sendMessage}
              className="bg-purple-600 text-white rounded-full w-10 h-10
                flex items-center justify-center hover:bg-purple-700 transition"
            >
              ➤
            </button>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-purple-600 text-white rounded-full w-14 h-14 flex items-center
          justify-center shadow-lg hover:bg-purple-700 transition text-2xl"
      >
        {isOpen ? "✕" : "💬"}
      </button>
    </div>
  );
}

export default LiveChat;
