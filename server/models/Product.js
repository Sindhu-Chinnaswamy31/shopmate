const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    image: {
      type: String,
      default: "",
    },
    images: [{ type: String }],
    category: {
      type: String,
      required: true,
    },
    stock: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    stockAlerts: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    label: {
      type: String,
      enum: ["new", "sale", "hot", "trending", null],
      default: null,
    },
    salePrice: { type: Number, default: null },
  },
  { timestamps: true }
); // adds createdAt, updatedAt automatically

module.exports = mongoose.model("Product", productSchema);
