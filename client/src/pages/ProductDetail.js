import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductById } from "../services/api";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import toast from "react-hot-toast";

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const { cartItems, addToCart, updateQuantity, removeFromCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const wishlisted = isWishlisted(product?._id);

  const cartItem = cartItems.find((item) => item._id === id);
  const quantity = cartItem ? cartItem.quantity : 0;

  useEffect(() => {
    getProductById(id)
      .then((res) => {
        setProduct(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-purple-600"></div>
      </div>
    );

  if (!product)
    return (
      <div className="text-center py-20">
        <p className="text-5xl mb-4">😕</p>
        <p className="text-gray-500">Product not found</p>
        <button
          onClick={() => navigate("/")}
          className="mt-4 text-purple-600 hover:underline"
        >
          Go back home
        </button>
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-purple-600 mb-6 transition"
      >
        ← Back
      </button>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-0">
        {/* Product Image */}
        <div className="bg-gray-100 flex items-center justify-center p-8 min-h-80">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="max-h-80 object-contain rounded-xl"
            />
          ) : (
            <span className="text-9xl">🛍️</span>
          )}
        </div>

        {/* Product Info */}
        <div className="p-8 flex flex-col justify-between">
          <div>
            {/* Category + Stock */}
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm bg-purple-100 text-purple-600 px-3 py-1 rounded-full font-medium">
                {product.category}
              </span>
              <div className="flex items-center gap-2">
                {/* Wishlist button */}
                <button
                  onClick={() => {
                    toggleWishlist(product);
                    toast.success(
                      wishlisted
                        ? "Removed from wishlist"
                        : "❤️ Added to wishlist!"
                    );
                  }}
                  className="flex items-center gap-1 border border-gray-200 px-3 py-1 rounded-full hover:border-red-400 transition text-sm"
                >
                  {wishlisted ? "❤️ Wishlisted" : "🤍 Wishlist"}
                </button>
                <span
                  className={`text-sm font-semibold ${
                    product.stock > 0 ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {product.stock > 0
                    ? `✓ ${product.stock} in stock`
                    : "✗ Out of stock"}
                </span>
              </div>
            </div>

            {/* Name */}
            <h1 className="text-3xl font-extrabold text-gray-800 mb-3">
              {product.name}
            </h1>

            {/* Price */}
            <p className="text-4xl font-bold text-purple-600 mb-4">
              ₹{product.price.toLocaleString()}
            </p>

            {/* Description */}
            <p className="text-gray-500 text-base leading-relaxed mb-6">
              {product.description}
            </p>

            {/* Divider */}
            <hr className="border-gray-100 mb-6" />

            {/* Product Details */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400">Category</p>
                <p className="font-semibold text-gray-700">
                  {product.category}
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400">Availability</p>
                <p className="font-semibold text-gray-700">
                  {product.stock > 0 ? "In Stock" : "Out of Stock"}
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400">Delivery</p>
                <p className="font-semibold text-gray-700">2-4 business days</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400">Returns</p>
                <p className="font-semibold text-gray-700">7 day return</p>
              </div>
            </div>
          </div>

          {/* Cart Controls */}
          {product.stock === 0 ? (
            <button
              disabled
              className="w-full py-4 rounded-xl font-bold text-lg bg-gray-200 text-gray-400 cursor-not-allowed"
            >
              ❌ Out of Stock
            </button>
          ) : quantity === 0 ? (
            <button
              onClick={() => addToCart(product)}
              className="w-full py-4 rounded-xl font-bold text-lg bg-purple-600 text-white hover:bg-purple-700 transition"
            >
              🛒 Add to Cart
            </button>
          ) : (
            <div>
              <div className="flex items-center justify-between bg-purple-50 rounded-xl px-4 py-3 mb-3">
                <button
                  onClick={() =>
                    quantity === 1
                      ? removeFromCart(product._id)
                      : updateQuantity(product._id, quantity - 1)
                  }
                  className="w-10 h-10 bg-purple-600 text-white rounded-full font-bold hover:bg-purple-700 transition flex items-center justify-center text-xl"
                >
                  −
                </button>
                <span className="font-bold text-purple-700 text-lg">
                  {quantity} in cart
                </span>
                <button
                  onClick={() =>
                    updateQuantity(
                      product._id,
                      Math.min(quantity + 1, product.stock)
                    )
                  }
                  disabled={quantity >= product.stock}
                  className={`w-10 h-10 rounded-full font-bold transition flex items-center justify-center text-xl
          ${
            quantity >= product.stock
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-purple-600 text-white hover:bg-purple-700"
          }`}
                >
                  +
                </button>
              </div>
              <button
                onClick={() => navigate("/cart")}
                className="w-full py-3 rounded-xl font-bold text-purple-600 border-2 border-purple-600 hover:bg-purple-50 transition"
              >
                View Cart →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
