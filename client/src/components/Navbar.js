import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";

function Navbar() {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const { wishlist } = useWishlist();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* Brand */}
        <Link
          to="/"
          className="text-2xl font-extrabold text-purple-600 tracking-tight"
        >
          🛍️ ShopMate
        </Link>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {/* Cart */}
          {user?.role !== "admin" && (
            <Link
              to="/cart"
              className="relative p-2 hover:bg-purple-50 rounded-full transition"
            >
              <span className="text-2xl">🛒</span>
              {totalItems > 0 && (
                <span
                  className="absolute -top-1 -right-1 bg-red-500 text-white
        text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
                >
                  {totalItems}
                </span>
              )}
            </Link>
          )}

          {user?.role === "admin" && (
            <div className="flex items-center gap-2">
              <Link to="/support"
                className="text-gray-600 hover:text-purple-600 transition text-sm font-medium">
                💬 Support
              </Link>
              <Link to="/admin"
                className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-semibold hover:bg-yellow-600 transition">
                👑 Admin
              </Link>
            </div>
          )}

          {user ? (
            <div className="flex items-center gap-3">
              {user && user.role !== "admin" && (
                <Link
                  to="/orders"
                  className="text-gray-600 hover:text-purple-600 transition text-sm font-medium"
                >
                  My Orders
                </Link>
              )}
              <div className="flex items-center gap-2 bg-purple-50 px-3 py-2 rounded-full">
                <div className="w-7 h-7 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <span className="text-gray-700 font-medium text-sm hidden sm:block">
                  {user.name}
                </span>
              </div>
              {user?.role !== "admin" && (
                <Link
                  to="/wishlist"
                  className="relative p-2 hover:bg-purple-50 rounded-full transition"
                >
                  <span className="text-2xl">🩶</span>
                  {wishlist.length > 0 && (
                    <span
                      className="absolute -top-1 -right-1 bg-red-500 text-white
        text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
                    >
                      {wishlist.length}
                    </span>
                  )}
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="text-sm text-red-500 hover:text-red-700 font-medium transition"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-gray-600 hover:text-purple-600 font-medium text-sm transition px-3 py-2"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-purple-600 text-white px-4 py-2 rounded-full text-sm
                  font-semibold hover:bg-purple-700 transition shadow"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
