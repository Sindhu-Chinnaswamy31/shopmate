import React, { useEffect, useState } from "react";
import { getProducts } from "../services/api";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext";
import toast from "react-hot-toast";
import StarRating from "../components/StarRating";
import { useRecentlyViewed } from "../context/RecentlyViewedContext";

function Home() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [inStockOnly, setInStockOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const { recentlyViewed, clearRecentlyViewed } = useRecentlyViewed();

  const categories = [
    "All",
    "Footwear",
    "Clothing",
    "Electronics",
    "Accessories",
    "Furniture",
    "Laptops",
    "Mobiles",
  ];

  useEffect(() => {
    getProducts()
      .then((res) => {
        setProducts(res.data);
        setFiltered(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let result = [...products];

    // Category filter
    if (activeCategory !== "All") {
      result = result.filter((p) => p.category === activeCategory);
    }

    // Search filter
    if (search.trim()) {
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Price range filter
    if (priceRange.min !== "") {
      result = result.filter((p) => p.price >= Number(priceRange.min));
    }
    if (priceRange.max !== "") {
      result = result.filter((p) => p.price <= Number(priceRange.max));
    }

    // In stock filter
    if (inStockOnly) {
      result = result.filter((p) => p.stock > 0);
    }

    // Sort
    switch (sortBy) {
      case "price_low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price_high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "newest":
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      default:
        break;
    }

    setFiltered(result);
  }, [search, activeCategory, sortBy, priceRange, inStockOnly, products]);

  const clearFilters = () => {
    setSearch("");
    setActiveCategory("All");
    setSortBy("newest");
    setPriceRange({ min: "", max: "" });
    setInStockOnly(false);
  };

  const activeFilterCount = [
    activeCategory !== "All",
    priceRange.min !== "",
    priceRange.max !== "",
    inStockOnly,
    sortBy !== "newest",
  ].filter(Boolean).length;

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-purple-600"></div>
      </div>
    );

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-700 to-indigo-700 text-white py-12 sm:py-20 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-5xl font-extrabold mb-4 leading-tight">
            Shop Smarter, <br /> Live Better 🛍️
          </h1>
          <p className="text-purple-200 text-base sm:text-lg mb-6 sm:mb-8">
            Discover amazing products at unbeatable prices
          </p>
          <div className="flex items-center bg-white rounded-full overflow-hidden shadow-lg max-w-xl mx-auto">
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-4 sm:px-6 py-3 text-gray-800 focus:outline-none text-sm sm:text-base"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="px-3 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
            <button className="bg-purple-600 px-4 sm:px-6 py-3 text-white font-semibold hover:bg-purple-700 transition text-sm sm:text-base">
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Category Pills */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full font-medium transition border text-sm
                ${
                  activeCategory === cat
                    ? "bg-purple-600 text-white border-purple-600"
                    : "bg-white text-gray-600 border-gray-300 hover:border-purple-400 hover:text-purple-600"
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div className="flex items-center gap-3 flex-wrap">
              {/* Filter Toggle Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition font-medium text-sm
                  ${
                    showFilters
                      ? "bg-purple-600 text-white border-purple-600"
                      : "bg-white text-gray-600 border-gray-300 hover:border-purple-400"
                  }`}
              >
                🔧 Filters
                {activeFilterCount > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                <option value="newest">🆕 Newest First</option>
                <option value="price_low">💰 Price: Low to High</option>
                <option value="price_high">💎 Price: High to Low</option>
                <option value="rating">⭐ Top Rated</option>
              </select>

              {/* In Stock Toggle */}
              <label className="flex items-center gap-2 cursor-pointer">
                <div
                  onClick={() => setInStockOnly(!inStockOnly)}
                  className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer
                    ${inStockOnly ? "bg-purple-600" : "bg-gray-300"}`}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform
                    ${inStockOnly ? "translate-x-5" : "translate-x-1"}`}
                  />
                </div>
                <span className="text-sm text-gray-600 font-medium">
                  In Stock Only
                </span>
              </label>

              {/* Clear Filters */}
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-red-500 hover:text-red-700 text-sm font-medium transition"
                >
                  ✕ Clear All
                </button>
              )}
            </div>

            {/* Results count */}
            <p className="text-gray-500 text-sm">
              <span className="font-bold text-gray-800">{filtered.length}</span>{" "}
              products found
            </p>
          </div>

          {/* Expandable Price Filter */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-sm font-semibold text-gray-700 mb-3">
                💰 Price Range
              </p>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-400 text-sm">
                    ₹
                  </span>
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) =>
                      setPriceRange({ ...priceRange, min: e.target.value })
                    }
                    className="border border-gray-300 rounded-xl pl-7 pr-3 py-2 w-32 text-sm
                      focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
                <span className="text-gray-400">—</span>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-400 text-sm">
                    ₹
                  </span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) =>
                      setPriceRange({ ...priceRange, max: e.target.value })
                    }
                    className="border border-gray-300 rounded-xl pl-7 pr-3 py-2 w-32 text-sm
                      focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
                {(priceRange.min || priceRange.max) && (
                  <button
                    onClick={() => setPriceRange({ min: "", max: "" })}
                    className="text-red-400 hover:text-red-600 text-sm"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Active Filter Tags */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {activeCategory !== "All" && (
              <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                📂 {activeCategory}
                <button
                  onClick={() => setActiveCategory("All")}
                  className="ml-1 hover:text-purple-900"
                >
                  ✕
                </button>
              </span>
            )}
            {priceRange.min && (
              <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                Min ₹{priceRange.min}
                <button
                  onClick={() => setPriceRange({ ...priceRange, min: "" })}
                  className="ml-1"
                >
                  ✕
                </button>
              </span>
            )}
            {priceRange.max && (
              <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                Max ₹{priceRange.max}
                <button
                  onClick={() => setPriceRange({ ...priceRange, max: "" })}
                  className="ml-1"
                >
                  ✕
                </button>
              </span>
            )}
            {inStockOnly && (
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                ✅ In Stock Only
                <button onClick={() => setInStockOnly(false)} className="ml-1">
                  ✕
                </button>
              </span>
            )}
            {sortBy !== "newest" && (
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                🔃{" "}
                {sortBy === "price_low"
                  ? "Price: Low→High"
                  : sortBy === "price_high"
                  ? "Price: High→Low"
                  : "Top Rated"}
                <button onClick={() => setSortBy("newest")} className="ml-1">
                  ✕
                </button>
              </span>
            )}
          </div>
        )}

        {/* Product Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-gray-500 text-lg">No products found</p>
            <button
              onClick={clearFilters}
              className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-xl hover:bg-purple-700 transition"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}

        {recentlyViewed.length > 0 && (
          <div className="mt-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                👁️ Recently Viewed
              </h2>
              <button
                onClick={clearRecentlyViewed}
                className="text-sm text-gray-400 hover:text-red-500 transition"
              >
                Clear all
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {recentlyViewed.slice(0, 6).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ProductCard({ product }) {
  const { cartItems, addToCart, updateQuantity, removeFromCart } = useCart();
  const cartItem = cartItems.find((item) => item._id === product._id);
  const quantity = cartItem ? cartItem.quantity : 0;
  const navigate = useNavigate();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const wishlisted = isWishlisted(product._id);
  const productImage =
    product.image || (product.images && product.images[0]) || null;

  return (
    <div className="bg-white rounded-2xl shadow hover:shadow-xl transition-all duration-300 overflow-hidden group">
      <div
        onClick={() => navigate(`/product/${product._id}`)}
        className="cursor-pointer"
      >
        <div className="bg-gray-100 h-48 flex items-center justify-center overflow-hidden relative">
          {productImage ? (
            <img
              src={productImage}
              alt={product.name}
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <span className="text-6xl">🛍️</span>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(product);
              toast.success(
                wishlisted ? "Removed from wishlist" : "❤️ Added to wishlist!"
              );
            }}
            className={`absolute top-2 right-2 rounded-full p-1.5 shadow hover:scale-110 transition text-4xl
              ${wishlisted ? "text-red-500" : "text-gray-300"}`}
          >
            ♥
          </button>
          {product.stock <= 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
              <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                Out of Stock
              </span>
            </div>
          )}
        </div>
        <div className="px-4 pt-3">
          <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full font-medium">
            {product.category}
          </span>
          <div className="flex items-center gap-1 mt-1">
            <StarRating rating={product.rating || 0} size="sm" />
            <span className="text-xs text-gray-400">
              ({product.numReviews || 0})
            </span>
          </div>
          <h3 className="font-semibold text-gray-800 mt-1 text-base leading-snug hover:text-purple-600 transition">
            {product.name}
          </h3>
          <p className="text-gray-400 text-sm mt-1 line-clamp-2">
            {product.description}
          </p>
        </div>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-center mt-1">
          <p className="text-purple-600 font-bold text-xl">
            ₹{product.price.toLocaleString()}
          </p>
          <p
            className={`text-xs font-medium ${
              product.stock > 0 ? "text-green-500" : "text-red-500"
            }`}
          >
            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
          </p>
        </div>
        {quantity === 0 ? (
          <button
            onClick={() => product.stock > 0 && addToCart(product)}
            disabled={product.stock <= 0}
            className={`mt-4 w-full py-2 rounded-xl font-semibold transition-all duration-300
              ${
                product.stock <= 0
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-purple-600 text-white hover:bg-purple-700"
              }`}
          >
            {product.stock <= 0 ? "Out of Stock" : "Add to Cart"}
          </button>
        ) : (
          <div className="mt-4 flex items-center justify-between bg-purple-50 rounded-xl px-3 py-2">
            <button
              onClick={() =>
                quantity === 1
                  ? removeFromCart(product._id)
                  : updateQuantity(product._id, quantity - 1)
              }
              className="w-8 h-8 bg-purple-600 text-white rounded-full font-bold hover:bg-purple-700 transition flex items-center justify-center"
            >
              −
            </button>
            <span className="font-bold text-purple-700 text-base">
              {quantity} added
            </span>
            <button
              onClick={() =>
                updateQuantity(
                  product._id,
                  Math.min(quantity + 1, product.stock)
                )
              }
              disabled={quantity >= product.stock}
              className={`w-8 h-8 rounded-full font-bold transition flex items-center justify-center
                ${
                  quantity >= product.stock
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-purple-600 text-white hover:bg-purple-700"
                }`}
            >
              +
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
