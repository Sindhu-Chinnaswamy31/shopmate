import React, { useEffect, useState } from "react";
import { getProducts } from "../services/api";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext";
import toast from "react-hot-toast";
import StarRating from "../components/StarRating";

function Home() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = [
    "All",
    "Footwear",
    "Clothing",
    "Electronics",
    "Accessories",
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
    let result = products;
    if (activeCategory !== "All") {
      result = result.filter((p) => p.category === activeCategory);
    }
    if (search.trim()) {
      result = result.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    setFiltered(result);
  }, [search, activeCategory, products]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-purple-600"></div>
      </div>
    );

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-700 to-indigo-700 text-white py-20 px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-extrabold mb-4 leading-tight">
            Shop Smarter, <br /> Live Better 🛍️
          </h1>
          <p className="text-purple-200 text-lg mb-8">
            Discover amazing products at unbeatable prices
          </p>
          <div className="flex items-center bg-white rounded-full overflow-hidden shadow-lg max-w-xl mx-auto">
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-6 py-3 text-gray-800 focus:outline-none text-base"
            />
            <button className="bg-purple-600 px-6 py-3 text-white font-semibold hover:bg-purple-700 transition">
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Category Filter */}
        <div className="flex gap-3 mb-8 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full font-medium transition border
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

        {/* Results count */}
        <p className="text-gray-500 mb-6 text-sm">
          Showing{" "}
          <span className="font-semibold text-gray-800">{filtered.length}</span>{" "}
          products
          {activeCategory !== "All" && ` in "${activeCategory}"`}
          {search && ` for "${search}"`}
        </p>

        {/* Product Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-gray-500 text-lg">No products found</p>
            <button
              onClick={() => {
                setSearch("");
                setActiveCategory("All");
              }}
              className="mt-4 text-purple-600 hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
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

  return (
    <div className="bg-white rounded-2xl shadow hover:shadow-xl transition-all duration-300 overflow-hidden group">
      <div
        onClick={() => navigate(`/product/${product._id}`)}
        className="cursor-pointer"
      >
        <div className="bg-gray-100 h-48 flex items-center justify-center overflow-hidden relative">
          {product.image ? (
            <img
              src={product.image}
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
        </div>
        <div className="px-4 pt-3">
          <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full font-medium">
            {product.category}
          </span>
          {/* ⭐ Star Rating */}
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
          <p className="text-purple-600 font-bold text-xl">₹{product.price}</p>
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
            {product.stock <= 0 ? "❌ Out of Stock" : "Add to Cart"}
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
