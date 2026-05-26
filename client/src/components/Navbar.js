import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import NotificationBell from "./NotificationBell";
import { useTheme } from "../context/ThemeContext";

function Navbar() {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate("/");
    setMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* Brand */}
        <Link
          to="/"
          className="text-xl font-extrabold text-purple-600 tracking-tight"
        >
          🛍️ ShopMate
        </Link>

        {/* Desktop Right Side */}
        <div className="hidden md:flex items-center gap-4">
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

          {user && user.role !== "admin" && <NotificationBell />}

          {user?.role === "admin" && (
            <div className="flex items-center gap-2">
              <Link
                to="/support"
                className="text-gray-600 hover:text-purple-600 text-sm font-medium transition"
              >
                💬 Support
              </Link>
              <Link
                to="/admin"
                className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-semibold hover:bg-yellow-600 transition"
              >
                👑 Admin
              </Link>
            </div>
          )}

          {user ? (
            <div className="flex items-center gap-3">
              {user.role !== "admin" && (
                <>
                  <Link
                    to="/orders"
                    className="text-gray-600 hover:text-purple-600 transition text-sm font-medium"
                  >
                    My Orders
                  </Link>
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
                </>
              )}
              <Link
                to="/profile"
                className="flex items-center gap-2 bg-purple-50 px-3 py-2 rounded-full hover:bg-purple-100 transition"
              >
                <div className="w-7 h-7 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <span className="text-gray-700 font-medium text-sm">
                  {user.name}
                </span>
              </Link>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-purple-50 transition text-xl"
                title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {isDark ? "☀️" : "🌙"}
              </button>
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
                className="bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-purple-700 transition shadow"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Right — Cart + Hamburger */}
        <div className="flex md:hidden items-center gap-3">
          {user?.role !== "admin" && (
            <Link to="/cart" className="relative p-2">
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
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition"
          >
            <div
              className={`w-6 h-0.5 bg-gray-700 transition-all duration-300 ${
                menuOpen ? "rotate-45 translate-y-1.5" : ""
              }`}
            />
            <div
              className={`w-6 h-0.5 bg-gray-700 my-1.5 transition-all ${
                menuOpen ? "opacity-0" : ""
              }`}
            />
            <div
              className={`w-6 h-0.5 bg-gray-700 transition-all duration-300 ${
                menuOpen ? "-rotate-45 -translate-y-1.5" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 flex flex-col gap-3">
          {user ? (
            <>
              <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{user.name}</p>
                  <p className="text-xs text-gray-400">{user.role}</p>
                </div>
              </div>

              {user.role !== "admin" && (
                <>
                  <Link
                    to="/orders"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 py-2 text-gray-700 hover:text-purple-600 transition"
                  >
                    📦 My Orders
                  </Link>
                  <Link
                    to="/wishlist"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 py-2 text-gray-700 hover:text-purple-600 transition"
                  >
                    ❤️ Wishlist {wishlist.length > 0 && `(${wishlist.length})`}
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 py-2 text-gray-700 hover:text-purple-600 transition"
                  >
                    👤 My Profile
                  </Link>
                  <Link
                    to="/addresses"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 py-2 text-gray-700 hover:text-purple-600 transition"
                  >
                    📍 My Addresses
                  </Link>
                </>
              )}

              {user.role === "admin" && (
                <>
                  <Link
                    to="/admin"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 py-2 text-gray-700 hover:text-purple-600 transition"
                  >
                    👑 Admin Panel
                  </Link>
                  <Link
                    to="/support"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 py-2 text-gray-700 hover:text-purple-600 transition"
                  >
                    💬 Support Chat
                  </Link>
                </>
              )}

              <button
                onClick={handleLogout}
                className="flex items-center gap-3 py-2 text-red-500 hover:text-red-700 transition"
              >
                🚪 Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="py-2 text-gray-700 hover:text-purple-600 transition font-medium"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setMenuOpen(false)}
                className="bg-purple-600 text-white py-3 rounded-xl text-center font-semibold hover:bg-purple-700 transition"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;
