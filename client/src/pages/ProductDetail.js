import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductById, getReviews, addReview, deleteReview } from "../services/api";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";
import StarRating from "../components/StarRating";
import toast from "react-hot-toast";

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [reviewLoading, setReviewLoading] = useState(false);
  const { cartItems, addToCart, updateQuantity, removeFromCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const wishlisted = isWishlisted(product?._id);
  const cartItem = cartItems.find((item) => item._id === id);
  const quantity = cartItem ? cartItem.quantity : 0;

  useEffect(() => {
    getProductById(id)
      .then((res) => { setProduct(res.data); setLoading(false); })
      .catch((err) => { console.error(err); setLoading(false); });

    getReviews(id)
      .then((res) => setReviews(res.data))
      .catch((err) => console.error(err));
  }, [id]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) { toast.error("Please login to review"); return; }
    if (!reviewForm.comment.trim()) { toast.error("Please write a comment"); return; }
    setReviewLoading(true);
    try {
      await addReview(id, { ...reviewForm, userName: user.name });
      toast.success("Review added! ⭐");
      setShowReviewForm(false);
      setReviewForm({ rating: 5, comment: "" });
      const res = await getReviews(id);
      setReviews(res.data);
      const productRes = await getProductById(id);
      setProduct(productRes.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add review");
    } finally {
      setReviewLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await deleteReview(reviewId);
      toast.success("Review deleted");
      const res = await getReviews(id);
      setReviews(res.data);
    } catch (err) {
      toast.error("Failed to delete review");
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-purple-600"></div>
    </div>
  );

  if (!product) return (
    <div className="text-center py-20">
      <p className="text-5xl mb-4">😕</p>
      <p className="text-gray-500">Product not found</p>
      <button onClick={() => navigate("/")} className="mt-4 text-purple-600 hover:underline">
        Go back home
      </button>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-purple-600 mb-6 transition">
        ← Back
      </button>

      {/* Product Card */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-0">
        {/* Image */}
        <div className="bg-gray-100 flex items-center justify-center p-8 min-h-80">
          {product.image ? (
            <img src={product.image} alt={product.name}
              className="max-h-80 object-contain rounded-xl" />
          ) : (
            <span className="text-9xl">🛍️</span>
          )}
        </div>

        {/* Info */}
        <div className="p-8 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm bg-purple-100 text-purple-600 px-3 py-1 rounded-full font-medium">
                {product.category}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    toggleWishlist(product);
                    toast.success(wishlisted ? "Removed from wishlist" : "❤️ Added to wishlist!");
                  }}
                  className="flex items-center gap-1 border border-gray-200 px-3 py-1 rounded-full hover:border-red-400 transition text-sm">
                  {wishlisted ? "❤️ Wishlisted" : "🤍 Wishlist"}
                </button>
                <span className={`text-sm font-semibold ${product.stock > 0 ? "text-green-500" : "text-red-500"}`}>
                  {product.stock > 0 ? `✓ ${product.stock} in stock` : "✗ Out of stock"}
                </span>
              </div>
            </div>

            <h1 className="text-3xl font-extrabold text-gray-800 mb-2">{product.name}</h1>

            {/* Rating summary */}
            <div className="flex items-center gap-2 mb-3">
              <StarRating rating={product.rating || 0} size="md" />
              <span className="text-gray-500 text-sm">
                {product.rating || 0} ({product.numReviews || 0} reviews)
              </span>
            </div>

            <p className="text-4xl font-bold text-purple-600 mb-4">
              ₹{product.price.toLocaleString()}
            </p>
            <p className="text-gray-500 text-base leading-relaxed mb-6">{product.description}</p>
            <hr className="border-gray-100 mb-6" />

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400">Category</p>
                <p className="font-semibold text-gray-700">{product.category}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400">Availability</p>
                <p className="font-semibold text-gray-700">{product.stock > 0 ? "In Stock" : "Out of Stock"}</p>
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
          {product.stock <= 0 ? (
            <button disabled className="w-full py-4 rounded-xl font-bold text-lg bg-gray-200 text-gray-400 cursor-not-allowed">
              ❌ Out of Stock
            </button>
          ) : quantity === 0 ? (
            <button onClick={() => addToCart(product)}
              className="w-full py-4 rounded-xl font-bold text-lg bg-purple-600 text-white hover:bg-purple-700 transition">
              🛒 Add to Cart
            </button>
          ) : (
            <div>
              <div className="flex items-center justify-between bg-purple-50 rounded-xl px-4 py-3 mb-3">
                <button
                  onClick={() => quantity === 1 ? removeFromCart(product._id) : updateQuantity(product._id, quantity - 1)}
                  className="w-10 h-10 bg-purple-600 text-white rounded-full font-bold hover:bg-purple-700 transition flex items-center justify-center text-xl">
                  −
                </button>
                <span className="font-bold text-purple-700 text-lg">{quantity} in cart</span>
                <button
                  onClick={() => updateQuantity(product._id, Math.min(quantity + 1, product.stock))}
                  disabled={quantity >= product.stock}
                  className={`w-10 h-10 rounded-full font-bold transition flex items-center justify-center text-xl
                    ${quantity >= product.stock ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-purple-600 text-white hover:bg-purple-700"}`}>
                  +
                </button>
              </div>
              <button onClick={() => navigate("/cart")}
                className="w-full py-3 rounded-xl font-bold text-purple-600 border-2 border-purple-600 hover:bg-purple-50 transition">
                View Cart →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ⭐ Reviews Section */}
      <div className="mt-10">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Customer Reviews</h2>
            <div className="flex items-center gap-2 mt-1">
              <StarRating rating={product.rating || 0} size="md" />
              <span className="text-gray-500 text-sm">
                {product.rating || 0} out of 5 ({product.numReviews || 0} reviews)
              </span>
            </div>
          </div>
          {user && user.role !== "admin" && (
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="bg-purple-600 text-white px-4 py-2 rounded-xl hover:bg-purple-700 transition font-semibold">
              {showReviewForm ? "Cancel" : "✍️ Write Review"}
            </button>
          )}
        </div>

        {/* Review Form */}
        {showReviewForm && (
          <div className="bg-white rounded-2xl shadow p-6 mb-6">
            <h3 className="font-bold text-gray-800 mb-4">Your Review</h3>
            <form onSubmit={handleSubmitReview} className="flex flex-col gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Rating</p>
                <StarRating
                  rating={reviewForm.rating}
                  size="lg"
                  interactive={true}
                  onRate={(star) => setReviewForm({ ...reviewForm, rating: star })}
                />
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Comment</p>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  placeholder="Share your experience with this product..."
                  rows={4}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
                />
              </div>
              <button type="submit" disabled={reviewLoading}
                className="bg-purple-600 text-white py-3 rounded-xl hover:bg-purple-700 transition font-semibold disabled:opacity-60">
                {reviewLoading ? "Submitting..." : "Submit Review ⭐"}
              </button>
            </form>
          </div>
        )}

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow">
            <p className="text-4xl mb-3">⭐</p>
            <p className="text-gray-500">No reviews yet. Be the first to review!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {reviews.map(review => (
              <div key={review._id} className="bg-white rounded-2xl shadow p-6">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {review.userName?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{review.userName}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(review.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'long', year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StarRating rating={review.rating} size="sm" />
                    {user && user.id === review.user && (
                      <button
                        onClick={() => handleDeleteReview(review._id)}
                        className="text-red-400 hover:text-red-600 text-sm ml-2">
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-gray-600 mt-3 leading-relaxed">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductDetail;