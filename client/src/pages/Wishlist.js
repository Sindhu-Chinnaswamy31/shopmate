import React from "react";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

function Wishlist() {
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (wishlist.length === 0)
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-5xl">🤍</p>
        <p className="text-xl text-gray-500">Your wishlist is empty!</p>
        <Link
          to="/"
          className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
        >
          Explore Products
        </Link>
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Wishlist ❤️</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {wishlist.map((product) => (
          <div
            key={product._id}
            className="bg-white rounded-2xl shadow hover:shadow-xl transition overflow-hidden"
          >
            {/* Image */}
            <div className="h-48 bg-gray-100 overflow-hidden relative">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-5xl">
                  🛍️
                </div>
              )}
              {/* Remove from wishlist */}
              <button
                onClick={() => {
                  toggleWishlist(product);
                  toast.success("Removed from wishlist");
                }}
                className="absolute top-2 right-2 rounded-full p-1.5 shadow hover:scale-110 transition text-red-500 font-bold text-4xl"
              >
                ♥
              </button>
            </div>

            <div className="p-4">
              <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full">
                {product.category}
              </span>
              <h3 className="font-semibold text-gray-800 mt-2">
                {product.name}
              </h3>
              <p className="text-purple-600 font-bold text-xl mt-1">
                ₹{product.price}
              </p>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => {
                    addToCart(product);
                    toast.success("Added to cart! 🛒");
                  }}
                  className="flex-1 bg-purple-600 text-white py-2 rounded-xl hover:bg-purple-700 transition font-semibold text-sm"
                >
                  Add to Cart
                </button>
                <Link
                  to={`/product/${product._id}`}
                  className="px-3 py-2 border border-gray-200 rounded-xl hover:border-purple-400 transition text-sm flex items-center"
                >
                  View
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Wishlist;
