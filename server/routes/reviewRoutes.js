const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { protect } = require('../middleware/authMiddleware');

// GET all reviews for a product
router.get('/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST — Add review (only if user bought the product)
router.post('/:productId', protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;

    // Check if user already reviewed
    const existing = await Review.findOne({
      product: req.params.productId,
      user: req.user.id
    });
    if (existing) {
      return res.status(400).json({ message: 'You already reviewed this product' });
    }

    // Check if user bought this product
    const order = await Order.findOne({
      user: req.user.id,
      status: { $in: ['paid', 'shipped', 'delivered'] },
      'items.product': req.params.productId
    });
    if (!order) {
      return res.status(400).json({ message: 'You can only review products you have purchased' });
    }

    // Create review
    const review = new Review({
      product: req.params.productId,
      user: req.user.id,
      userName: req.body.userName,
      rating: Number(rating),
      comment
    });
    await review.save();

    // Update product rating
    const reviews = await Review.find({ product: req.params.productId });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await Product.findByIdAndUpdate(req.params.productId, {
      rating: avgRating.toFixed(1),
      numReviews: reviews.length
    });

    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE review
router.delete('/:reviewId', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await review.deleteOne();

    // Recalculate rating
    const reviews = await Review.find({ product: review.product });
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;
    await Product.findByIdAndUpdate(review.product, {
      rating: avgRating.toFixed(1),
      numReviews: reviews.length
    });

    res.json({ message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;