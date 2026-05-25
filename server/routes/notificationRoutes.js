const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

// GET user notifications
router.get('/', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20);
    const unreadCount = await Notification.countDocuments({
      user: req.user.id,
      isRead: false
    });
    res.json({ notifications, unreadCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// MARK single as read
router.put('/:id/read', protect, async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { isRead: true }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// MARK ALL as read
router.put('/read-all', protect, async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, isRead: false },
      { isRead: true }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE notification
router.delete('/:id', protect, async (req, res) => {
  try {
    await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ADMIN — Send broadcast notification to all users
router.post('/broadcast', protect, adminOnly, async (req, res) => {
  try {
    const { title, message, type, link } = req.body;
    const users = await User.find({ role: 'user' }).select('_id');
    const notifications = users.map(u => ({
      user: u._id, title, message, type: type || 'offer', link: link || null
    }));
    await Notification.insertMany(notifications);
    res.json({ message: `Notification sent to ${users.length} users!` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;