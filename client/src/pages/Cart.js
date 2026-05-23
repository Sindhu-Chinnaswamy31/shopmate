import React from "react";
import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createPaymentOrder, verifyPayment } from "../services/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

function Cart() {
  const { cartItems, removeFromCart, updateQuantity, totalPrice, clearCart } =
    useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

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

    try {
      const { data } = await createPaymentOrder({
        totalAmount: totalPrice,
        items: cartItems.map((item) => ({
          product: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Cart 🛒</h1>
      <div className="flex flex-col gap-4">
        {cartItems.map((item) => (
          <div
            key={item._id}
            className="bg-white rounded-xl shadow p-4 flex justify-between items-center"
          >
            <div>
              <h3 className="font-semibold text-lg">{item.name}</h3>
              <p className="text-purple-600 font-bold">₹{item.price}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item._id, item.quantity - 1)}
                  className="bg-gray-200 px-3 py-1 rounded-lg hover:bg-gray-300 font-bold"
                >
                  -
                </button>
                <span className="font-semibold w-6 text-center">
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(item._id, item.quantity + 1)}
                  className="bg-gray-200 px-3 py-1 rounded-lg hover:bg-gray-300 font-bold"
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

      {/* Total & Checkout */}
      <div className="mt-8 bg-white rounded-xl shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-xl font-semibold">Total:</span>
          <span className="text-2xl font-bold text-purple-600">
            ₹{totalPrice}
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
