import React, { useEffect, useState } from "react";
import { getMyOrders } from "../services/api";
import { Link } from "react-router-dom";

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyOrders()
      .then((res) => {
        setOrders(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-600";
      case "shipped":
        return "bg-blue-100 text-blue-600";
      case "delivered":
        return "bg-purple-100 text-purple-600";
      case "failed":
        return "bg-red-100 text-red-600";
      default:
        return "bg-yellow-100 text-yellow-600";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "paid":
        return "✅";
      case "shipped":
        return "🚚";
      case "delivered":
        return "📦";
      case "failed":
        return "❌";
      default:
        return "⏳";
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-purple-600"></div>
      </div>
    );

  if (orders.length === 0)
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-5xl">📦</p>
        <p className="text-xl text-gray-500">No orders yet!</p>
        <Link
          to="/"
          className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
        >
          Start Shopping
        </Link>
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Orders 📦</h1>
      <div className="flex flex-col gap-6">
        {orders.map((order) => (
          <div
            key={order._id}
            className="bg-white rounded-2xl shadow-md overflow-hidden"
          >
            {/* Order Header */}
            <div className="bg-gray-50 px-6 py-4 flex justify-between items-center flex-wrap gap-3">
              <div>
                <p className="text-xs text-gray-400 font-mono">
                  Order #{order._id.slice(-8).toUpperCase()}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Placed on{" "}
                  {new Date(order.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                    order.status
                  )}`}
                >
                  {getStatusIcon(order.status)}{" "}
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
                <span className="text-lg font-bold text-purple-600">
                  ₹{order.totalAmount.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Order Items */}
            <div className="px-6 py-4 divide-y divide-gray-50">
              {order.items.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center py-3"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-2xl">
                      🛍️
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{item.name}</p>
                      <p className="text-sm text-gray-400">
                        Qty: {item.quantity}
                      </p>
                    </div>
                  </div>
                  <p className="font-semibold text-gray-700">
                    ₹{(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            {/* Order Footer */}
            <div className="px-6 py-4 bg-gray-50 flex justify-between items-center">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>💳</span>
                <span>Paid via Razorpay</span>
              </div>
              {order.status === "delivered" && (
                <button className="text-purple-600 text-sm font-semibold hover:underline">
                  Write a Review
                </button>
              )}
              {order.status === "paid" && (
                <span className="text-sm text-green-600 font-medium">
                  🚚 Will be shipped soon
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyOrders;
