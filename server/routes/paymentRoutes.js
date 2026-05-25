const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
const crypto = require("crypto");
const Order = require("../models/Order");
const { protect } = require("../middleware/authMiddleware");
const { sendOrderConfirmation } = require("../utils/emailService");
const User = require("../models/User");
const Coupon = require('../models/Coupon');
const Notification = require('../models/Notification');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Razorpay order
router.post("/create-order", protect, async (req, res) => {
  try {
    const { totalAmount, items } = req.body;

    const options = {
      amount: totalAmount * 100, // Razorpay takes amount in paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // Save order in DB as pending
    const order = new Order({
      user: req.user.id,
      items,
      totalAmount,
      razorpayOrderId: razorpayOrder.id,
      status: "pending",
    });
    await order.save();

    res.json({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      dbOrderId: order._id,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Verify payment after success
router.post("/verify", protect, async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, dbOrderId } =
      req.body;

    const body = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({ message: "Payment verification failed" });
    }

    const order = await Order.findByIdAndUpdate(
      dbOrderId,
      { razorpayPaymentId, status: "paid" },
      { returnDocument: 'after' }
    );

    await Notification.create({
      user: req.user.id,
      title: "✅ Order Placed Successfully!",
      message: `Your order #${order._id
        .toString()
        .slice(-6)
        .toUpperCase()} has been placed. Total: ₹${order.totalAmount}`,
      type: "order",
      link: "/orders",
    });

    // Decrease stock
    const Product = require("../models/Product");
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    // Send confirmation email
    const user = await User.findById(req.user.id);
    await sendOrderConfirmation(user.email, user.name, order);

    res.json({ message: "Payment verified successfully! ✅" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET logged in user's orders
router.get("/my-orders", protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//Coupon code
router.post('/create-order', protect, async (req, res) => {
  try {
    const { totalAmount, items, couponCode } = req.body;

    const options = {
      amount: totalAmount * 100,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`
    };

    const razorpayOrder = await razorpay.orders.create(options);

    const order = new Order({
      user: req.user.id,
      items,
      totalAmount,
      couponCode: couponCode || null,
      razorpayOrderId: razorpayOrder.id,
      status: 'pending'
    });
    await order.save();

    // Increment coupon usage
    if (couponCode) {
      await Coupon.findOneAndUpdate(
        { code: couponCode.toUpperCase() },
        { $inc: { usedCount: 1 } },
        { returnDocument: 'after' }
      );
    }

    res.json({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      dbOrderId: order._id
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
