import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNotifications, markAsRead, markAllAsRead, deleteNotification } from '../services/api';
import toast from 'react-hot-toast';

function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
//   const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadNotifications();
    // Poll every 30 seconds for new notifications
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadNotifications = async () => {
    try {
      const res = await getNotifications();
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unreadCount);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) { console.error(err); }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All marked as read!');
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      await deleteNotification(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
      const deleted = notifications.find(n => n._id === id);
      if (deleted && !deleted.isRead) setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) { console.error(err); }
  };

  const handleClick = async (notification) => {
    if (!notification.isRead) await handleMarkAsRead(notification._id);
    if (notification.link) { navigate(notification.link); setIsOpen(false); }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'order': return '📦';
      case 'offer': return '🏷️';
      case 'stock': return '⚠️';
      default: return '🔔';
    }
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => { setIsOpen(!isOpen); if (!isOpen) loadNotifications(); }}
        className="relative p-2 hover:bg-purple-50 rounded-full transition">
        <span className="text-2xl">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white
            text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl
          border border-gray-100 z-50 max-h-96 overflow-hidden flex flex-col">

          {/* Header */}
          <div className="flex justify-between items-center px-4 py-3 border-b">
            <h3 className="font-bold text-gray-800">
              Notifications {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full ml-1">
                  {unreadCount} new
                </span>
              )}
            </h3>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllAsRead}
                className="text-purple-600 text-sm hover:underline font-medium">
                Mark all read
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <p className="text-3xl mb-2">🔔</p>
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification._id}
                  onClick={() => handleClick(notification)}
                  className={`flex items-start gap-3 px-4 py-3 border-b cursor-pointer
                    hover:bg-gray-50 transition
                    ${!notification.isRead ? 'bg-purple-50' : 'bg-white'}`}>

                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center
                    flex-shrink-0 text-lg
                    ${!notification.isRead ? 'bg-purple-100' : 'bg-gray-100'}`}>
                    {getTypeIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold text-gray-800 ${!notification.isRead ? 'font-bold' : ''}`}>
                      {notification.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {getTimeAgo(notification.createdAt)}
                    </p>
                  </div>

                  {/* Delete + Unread dot */}
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <button
                      onClick={(e) => handleDelete(e, notification._id)}
                      className="text-gray-300 hover:text-red-400 text-sm transition">
                      ✕
                    </button>
                    {!notification.isRead && (
                      <div className="w-2 h-2 bg-purple-600 rounded-full mt-1" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;