const express = require('express');
const router = express.Router();
const Address = require('../models/Address');
const { protect } = require('../middleware/authMiddleware');

// GET all addresses for user
router.get('/', protect, async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.user.id })
      .sort({ isDefault: -1, createdAt: -1 });
    res.json(addresses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ADD new address
router.post('/', protect, async (req, res) => {
  try {
    const { isDefault } = req.body;

    // If new address is default, remove default from others
    if (isDefault) {
      await Address.updateMany(
        { user: req.user.id },
        { isDefault: false }
      );
    }

    // If first address, make it default
    const count = await Address.countDocuments({ user: req.user.id });

    const address = new Address({
      ...req.body,
      user: req.user.id,
      isDefault: isDefault || count === 0
    });
    await address.save();
    res.status(201).json(address);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// UPDATE address
router.put('/:id', protect, async (req, res) => {
  try {
    const { isDefault } = req.body;

    if (isDefault) {
      await Address.updateMany(
        { user: req.user.id },
        { isDefault: false }
      );
    }

    const address = await Address.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { returnDocument: 'after' }
    );
    if (!address) return res.status(404).json({ message: 'Address not found' });
    res.json(address);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE address
router.delete('/:id', protect, async (req, res) => {
  try {
    const address = await Address.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });
    if (!address) return res.status(404).json({ message: 'Address not found' });

    // If deleted address was default, make first remaining address default
    if (address.isDefault) {
      const firstAddress = await Address.findOne({ user: req.user.id });
      if (firstAddress) {
        firstAddress.isDefault = true;
        await firstAddress.save();
      }
    }
    res.json({ message: 'Address deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// SET default address
router.put('/:id/default', protect, async (req, res) => {
  try {
    await Address.updateMany({ user: req.user.id }, { isDefault: false });
    const address = await Address.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { isDefault: true },
      { returnDocument: 'after' }
    );
    res.json(address);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;