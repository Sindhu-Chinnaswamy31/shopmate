const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const Order = require("../models/Order");
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");
const Notification = require('../models/Notification');

// All admin routes are protected + admin only
router.use(protect, adminOnly);

// ── DASHBOARD ──────────────────────────────
router.get("/dashboard", async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments();
    const orders = await Order.find().sort({ createdAt: 1 });
    const paidOrders = orders.filter(
      (o) => o.status !== "pending" && o.status !== "failed"
    );
    const totalRevenue = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    // Orders by status
    const ordersByStatus = {
      pending: orders.filter((o) => o.status === "pending").length,
      paid: orders.filter((o) => o.status === "paid").length,
      shipped: orders.filter((o) => o.status === "shipped").length,
      delivered: orders.filter((o) => o.status === "delivered").length,
      failed: orders.filter((o) => o.status === "failed").length,
    };

    // Revenue by month (last 6 months)
    const revenueByMonth = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = date.toLocaleString("default", { month: "short" });
      const year = date.getFullYear();
      const monthOrders = paidOrders.filter((o) => {
        const orderDate = new Date(o.createdAt);
        return (
          orderDate.getMonth() === date.getMonth() &&
          orderDate.getFullYear() === year
        );
      });
      const revenue = monthOrders.reduce((sum, o) => sum + o.totalAmount, 0);
      revenueByMonth.push({
        month: `${month} ${year}`,
        revenue,
        orders: monthOrders.length,
      });
    }

    // Top 5 products by sales
    const allItems = orders.flatMap((o) => o.items);
    const productSales = {};
    allItems.forEach((item) => {
      if (productSales[item.name]) {
        productSales[item.name] += item.quantity;
      } else {
        productSales[item.name] = item.quantity;
      }
    });
    const topProducts = Object.entries(productSales)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, sales]) => ({ name: name.substring(0, 15), sales }));

    // New users by month
    const users = await User.find().sort({ createdAt: 1 });
    const usersByMonth = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = date.toLocaleString("default", { month: "short" });
      const monthUsers = users.filter((u) => {
        const userDate = new Date(u.createdAt);
        return (
          userDate.getMonth() === date.getMonth() &&
          userDate.getFullYear() === date.getFullYear()
        );
      });
      usersByMonth.push({ month, users: monthUsers.length });
    }

    res.json({
      totalProducts,
      totalOrders,
      totalUsers,
      totalRevenue,
      ordersByStatus,
      revenueByMonth,
      topProducts,
      usersByMonth,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PRODUCTS ───────────────────────────────
// Get all products
router.get("/products", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add product
router.post("/products", async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update product
router.put("/products/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete product
router.delete("/products/:id", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── ORDERS ─────────────────────────────────
router.get("/orders", async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update order status
router.put("/orders/:id", async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ── USERS ──────────────────────────────────
router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/orders/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );

    // Send notification to user
    const statusMessages = {
      shipped: { title: '🚚 Order Shipped!', msg: `Your order #${order._id.toString().slice(-6).toUpperCase()} has been shipped!` },
      delivered: { title: '📦 Order Delivered!', msg: `Your order #${order._id.toString().slice(-6).toUpperCase()} has been delivered!` },
      paid: { title: '✅ Payment Confirmed!', msg: `Payment for order #${order._id.toString().slice(-6).toUpperCase()} confirmed!` },
      failed: { title: '❌ Order Failed', msg: `Your order #${order._id.toString().slice(-6).toUpperCase()} has failed.` },
    };

    if (statusMessages[req.body.status]) {
      await Notification.create({
        user: order.user,
        title: statusMessages[req.body.status].title,
        message: statusMessages[req.body.status].msg,
        type: 'order',
        link: '/orders'
      });
    }

    res.json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
