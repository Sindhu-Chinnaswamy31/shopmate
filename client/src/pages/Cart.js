import React, { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createPaymentOrder, verifyPayment } from "../services/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { applyCoupon } from "../services/api";
import { getAddresses } from "../services/api";

function Cart() {
  const { cartItems, removeFromCart, updateQuantity, totalPrice, clearCart } =
    useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);

  useEffect(() => {
    if (user) {
      getAddresses().then((res) => {
        setAddresses(res.data);
        const def = res.data.find((a) => a.isDefault);
        if (def) setSelectedAddress(def._id);
      });
    }
  }, [user]);

  if (cartItems.length === 0)
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-2xl">🛒 Your cart is empty!</p>
        <Link
          to="/"
          className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
        >
          Continue Shopping
        </Link>
      </div>
    );
  const handlePayment = async () => {
    if (!user) {
      toast.error("Please login to proceed with payment!");
      navigate("/login");
      return;
    }

    if (!user) {
      toast.error("Please login!");
      return;
    }
    if (addresses.length > 0 && !selectedAddress) {
      toast.error("Please select a delivery address!");
      return;
    }

    try {
      const { data } = await createPaymentOrder({
        totalAmount: appliedCoupon ? appliedCoupon.finalAmount : totalPrice,
        items: cartItems.map((item) => ({
          product: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        couponCode: appliedCoupon?.couponCode || null,
      });

      const options = {
        key: "rzp_test_SryvP4Hd7jwvnP",
        amount: data.amount,
        currency: data.currency,
        name: "ShopMate",
        description: "Order Payment",
        order_id: data.orderId,
        handler: async (response) => {
          try {
            await verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              dbOrderId: data.dbOrderId,
            });
            clearCart();
            toast.success("🎉 Order placed successfully!");
            navigate("/orders"); // we'll build this next
          } catch (err) {
            toast.error("Payment verification failed. Contact support.");
          }
        },
        prefill: { name: user?.name, email: user?.email },
        theme: { color: "#7C3AED" },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", () => {
        toast.error("❌ Payment failed. Please try again.");
      });

      rzp.open();
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    }
  };
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Enter a coupon code");
      return;
    }
    setCouponLoading(true);
    try {
      const res = await applyCoupon({
        code: couponCode,
        totalAmount: totalPrice,
      });
      setAppliedCoupon(res.data);
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid coupon");
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    toast.success("Coupon removed");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Cart 🛒</h1>
      <div className="flex flex-col gap-4">
        {cartItems.map((item) => (
          <div
            key={item._id}
            className="bg-white rounded-xl shadow p-4 flex flex-col sm:flex-row justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-purple-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  "🛍️"
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 text-sm sm:text-base">
                  {item.name}
                </h3>
                <p className="text-purple-600 font-bold">₹{item.price}</p>
              </div>
            </div>
            <div className="flex items-center justify-between sm:gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    item.quantity === 1
                      ? removeFromCart(item._id)
                      : updateQuantity(item._id, item.quantity - 1)
                  }
                  className="bg-gray-200 w-8 h-8 rounded-full font-bold hover:bg-gray-300 flex items-center justify-center"
                >
                  −
                </button>
                <span className="font-semibold w-6 text-center">
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(item._id, item.quantity + 1)}
                  className="bg-gray-200 w-8 h-8 rounded-full font-bold hover:bg-gray-300 flex items-center justify-center"
                >
                  +
                </button>
              </div>
              <p className="font-bold text-gray-700 w-20 text-right">
                ₹{item.price * item.quantity}
              </p>
              <button
                onClick={() => removeFromCart(item._id)}
                className="text-red-500 hover:text-red-700 text-xl"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Delivery Address */}
      {addresses.length > 0 && (
        <div className="bg-white rounded-xl shadow p-4 mb-4">
          <div className="flex justify-between items-center mb-3">
            <p className="font-semibold text-gray-800">📍 Delivery Address</p>
            <Link
              to="/addresses"
              className="text-purple-600 text-sm hover:underline"
            >
              Manage
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {addresses.map((address) => (
              <label
                key={address._id}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition
            ${
              selectedAddress === address._id
                ? "border-purple-500 bg-purple-50"
                : "border-gray-200 hover:border-purple-300"
            }`}
              >
                <input
                  type="radio"
                  name="address"
                  value={address._id}
                  checked={selectedAddress === address._id}
                  onChange={() => setSelectedAddress(address._id)}
                  className="mt-1 accent-purple-600"
                />
                <div className="text-sm">
                  <p className="font-semibold text-gray-800">
                    {address.fullName}
                  </p>
                  <p className="text-gray-500">
                    {address.addressLine1}, {address.city}, {address.state} -{" "}
                    {address.pincode}
                  </p>
                  <p className="text-gray-500">📞 {address.phone}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {addresses.length === 0 && user && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
          <p className="text-yellow-700 text-sm font-medium">
            ⚠️ Please add a delivery address before placing order
          </p>
          <Link
            to="/addresses"
            className="text-purple-600 text-sm font-semibold hover:underline mt-1 block"
          >
            + Add Address
          </Link>
        </div>
      )}

      {/* Coupon Section */}
      <div className="mt-6 bg-white rounded-xl shadow p-4">
        <p className="font-semibold text-gray-800 mb-3">🏷️ Have a coupon?</p>
        {appliedCoupon ? (
          <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3">
            <div>
              <p className="font-bold text-green-700">
                {appliedCoupon.couponCode} applied! ✅
              </p>
              <p className="text-sm text-green-600">
                You save ₹{appliedCoupon.discount}
              </p>
            </div>
            <button
              onClick={handleRemoveCoupon}
              className="text-red-500 hover:text-red-700 text-sm font-medium"
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder="Enter coupon code"
              className="flex-1 border border-gray-300 rounded-xl px-4 py-2
          focus:outline-none focus:ring-2 focus:ring-purple-400 uppercase"
            />
            <button
              onClick={handleApplyCoupon}
              disabled={couponLoading}
              className="bg-purple-600 text-white px-4 py-2 rounded-xl hover:bg-purple-700
          transition font-semibold disabled:opacity-60"
            >
              {couponLoading ? "..." : "Apply"}
            </button>
          </div>
        )}
      </div>

      {/* Total & Checkout */}
      <div className="mt-4 bg-white rounded-xl shadow p-6">
        {appliedCoupon && (
          <div className="flex justify-between items-center mb-2 text-gray-500">
            <span>Subtotal</span>
            <span>₹{totalPrice}</span>
          </div>
        )}
        {appliedCoupon && (
          <div className="flex justify-between items-center mb-2 text-green-600 font-medium">
            <span>Discount ({appliedCoupon.couponCode})</span>
            <span>- ₹{appliedCoupon.discount}</span>
          </div>
        )}
        <div className="flex justify-between items-center mb-4 border-t pt-3">
          <span className="text-xl font-semibold">Total</span>
          <span className="text-2xl font-bold text-purple-600">
            ₹{appliedCoupon ? appliedCoupon.finalAmount : totalPrice}
          </span>
        </div>
        <button
          onClick={handlePayment}
          className="w-full bg-purple-600 text-white py-3 rounded-xl
      hover:bg-purple-700 transition font-semibold text-lg"
        >
          Proceed to Payment 💳
        </button>
      </div>
    </div>
  );
}

export default Cart;
