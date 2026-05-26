import React, { useEffect, useState } from "react";
import { getMyOrders } from "../services/api";
import { Link } from "react-router-dom";

function OrderTimeline({ status }) {
  const steps = [
    { key: 'pending', label: 'Order Placed', icon: '📋' },
    { key: 'paid', label: 'Payment Done', icon: '💳' },
    { key: 'shipped', label: 'Shipped', icon: '🚚' },
    { key: 'delivered', label: 'Delivered', icon: '📦' },
  ];

  const statusOrder = ['pending', 'paid', 'shipped', 'delivered'];
  const currentIndex = statusOrder.indexOf(status);
  const isFailed = status === 'failed';

  if (isFailed) return (
    <div className="flex items-center gap-2 mt-3 text-red-500">
      <span>❌</span>
      <span className="text-sm font-semibold">Order Failed</span>
    </div>
  );

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between relative">
        {/* Progress Line */}
        <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 z-0">
          <div
            className="h-full bg-purple-600 transition-all duration-500"
            style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
          />
        </div>

        {steps.map((step, index) => {
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;
          return (
            <div key={step.key}
              className="flex flex-col items-center z-10 relative">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center
                text-lg border-2 transition-all duration-300
                ${isCompleted
                  ? 'bg-purple-600 border-purple-600 text-white'
                  : 'bg-white border-gray-300 text-gray-400'}
                ${isCurrent ? 'ring-4 ring-purple-200 scale-110' : ''}`}>
                {isCompleted ? (index < currentIndex ? '✓' : step.icon) : step.icon}
              </div>
              <p className={`text-xs mt-2 text-center font-medium max-w-16
                ${isCompleted ? 'text-purple-600' : 'text-gray-400'}`}>
                {step.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

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
            
            <OrderTimeline status={order.status} />

            {/* Order Footer */}
            <div className="px-6 py-4 bg-gray-50 flex justify-between items-center">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>💳</span>
                <span>Paid via Razorpay</span>
              </div>
              <div className="flex gap-3">
                {order.status === "delivered" && (
                  <span className="text-sm text-blue-600 font-medium">
                    ✅ Delivered
                  </span>
                )}
                {(order.status === "paid" ||
                  order.status === "delivered" ||
                  order.status === "shipped") && (
                  <button
                    onClick={() => {
                      // Go to first product in order to review
                      const firstItem = order.items[0];
                      if (firstItem?.product) {
                        window.location.href = `/product/${firstItem.product}`;
                      }
                    }}
                    className="text-sm bg-purple-600 text-white px-3 py-1 rounded-lg hover:bg-purple-700 transition"
                  >
                    ✍️ Write Review
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyOrders;
