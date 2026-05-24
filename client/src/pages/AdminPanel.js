import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  getDashboard,
  adminGetProducts,
  adminAddProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  adminGetOrders,
  adminUpdateOrder,
  adminGetUsers,
} from "../services/api";
import toast from "react-hot-toast";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function ProductForm({
  form,
  onSubmit,
  onCancel,
  onChange,
  title,
  errors = {},
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl max-h-screen overflow-y-auto">
        <h3 className="text-xl font-bold mb-6">{title}</h3>
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          {["name", "description", "price", "category", "stock", "image"].map(
            (field) => (
              <div key={field}>
                <input
                  type={["price", "stock"].includes(field) ? "number" : "text"}
                  name={field}
                  placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                  value={form[field]}
                  onChange={onChange}
                  className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2
                  ${
                    errors[field]
                      ? "border-red-400 focus:ring-red-200"
                      : "border-gray-300 focus:ring-purple-400"
                  }`}
                />
                {errors[field] && (
                  <p className="text-red-500 text-xs mt-1">
                    ⚠️ {errors[field]}
                  </p>
                )}
              </div>
            )
          )}
          <div className="flex gap-3 mt-2">
            <button
              type="submit"
              className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 font-semibold"
            >
              Save
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AdminPanel() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [dashboard, setDashboard] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    image: "",
  });
  const [productErrors, setProductErrors] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (user?.role !== "admin") {
      navigate("/");
      toast.error("Access denied!");
    }
  }, [navigate, user]);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await getDashboard();
      setDashboard(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadProducts = async () => {
    const res = await adminGetProducts();
    setProducts(res.data);
  };

  const loadOrders = async () => {
    const res = await adminGetOrders();
    setOrders(res.data);
  };

  const loadUsers = async () => {
    const res = await adminGetUsers();
    setUsers(res.data);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "support") navigate("/support");
    if (tab === "products") loadProducts();
    if (tab === "orders") loadOrders();
    if (tab === "users") loadUsers();
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateProduct = (form) => {
    const errors = {};
    if (!form.name.trim()) errors.name = "Product name is required";
    if (!form.description.trim())
      errors.description = "Description is required";
    if (!form.price || form.price <= 0)
      errors.price = "Valid price is required";
    if (!form.category.trim()) errors.category = "Category is required";
    if (form.stock === "" || form.stock < 0)
      errors.stock = "Valid stock is required";
    return errors;
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    const errors = validateProduct(form);
    if (Object.keys(errors).length > 0) {
      setProductErrors(errors);
      return;
    }
    setProductErrors({});
    try {
      await adminAddProduct({
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
      });
      toast.success("Product added! ✅");
      setShowAddProduct(false);
      setForm({
        name: "",
        description: "",
        price: "",
        category: "",
        stock: "",
        image: "",
      });
      loadProducts();
    } catch (err) {
      toast.error("Failed to add product");
    }
  };

  const handleEditProduct = async (e) => {
    e.preventDefault();
    const errors = validateProduct(form);
    if (Object.keys(errors).length > 0) {
      setProductErrors(errors);
      return;
    }
    setProductErrors({});
    try {
      await adminUpdateProduct(editProduct._id, {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
      });
      toast.success("Product updated! ✅");
      setEditProduct(null);
      loadProducts();
    } catch (err) {
      toast.error("Failed to update product");
    }
  };

  const handleDeleteProduct = async (id) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-2">
          <p className="font-semibold">Delete this product?</p>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  await adminDeleteProduct(id);
                  toast.success("Product deleted!");
                  loadProducts();
                } catch (err) {
                  toast.error("Failed to delete");
                }
              }}
              className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-600"
            >
              Delete
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="border border-gray-300 px-3 py-1 rounded-lg text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      { duration: 10000 }
    );
  };

  const handleOrderStatus = async (id, status) => {
    try {
      await adminUpdateOrder(id, { status });
      toast.success("Order status updated!");
      loadOrders();
    } catch (err) {
      toast.error("Failed to update order");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100 relative">
      {/* Sidebar */}
      <div
        className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
  md:translate-x-0 fixed md:relative z-40 w-64 bg-gray-900 text-white 
  flex flex-col transition-transform duration-300 h-full min-h-screen`}
      >
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-purple-400">👑 Admin Panel</h2>
          <p className="text-gray-400 text-sm mt-1">{user?.name}</p>
        </div>
        <nav className="flex-1 p-4 flex flex-col gap-2">
          {[
            { id: "dashboard", icon: "📊", label: "Dashboard" },
            { id: "products", icon: "📦", label: "Products" },
            { id: "orders", icon: "🧾", label: "Orders" },
            { id: "users", icon: "👥", label: "Users" },
            { id: "support", icon: "💬", label: "Support Chat" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition text-left
                ${
                  activeTab === tab.id
                    ? "bg-purple-600 text-white"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`}
            >
              <span>{tab.icon}</span>
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={() => navigate("/")}
            className="w-full text-gray-400 hover:text-white text-sm py-2 transition"
          >
            ← Back to Store
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-auto">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="md:hidden mb-4 bg-gray-900 text-white px-4 py-2 rounded-xl flex items-center gap-2"
        >
          ☰ Menu
        </button>
        {/* ── DASHBOARD ── */}
        {activeTab === "dashboard" && dashboard && (
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">
              Dashboard 📊
            </h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[
                {
                  label: "Total Products",
                  value: dashboard.totalProducts,
                  icon: "📦",
                  color: "bg-blue-500",
                  bg: "bg-blue-50",
                },
                {
                  label: "Total Orders",
                  value: dashboard.totalOrders,
                  icon: "🧾",
                  color: "bg-green-500",
                  bg: "bg-green-50",
                },
                {
                  label: "Total Users",
                  value: dashboard.totalUsers,
                  icon: "👥",
                  color: "bg-yellow-500",
                  bg: "bg-yellow-50",
                },
                {
                  label: "Revenue",
                  value: `₹${dashboard.totalRevenue.toLocaleString()}`,
                  icon: "💰",
                  color: "bg-purple-500",
                  bg: "bg-purple-50",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className={`${stat.bg} rounded-2xl p-6 border border-gray-100`}
                >
                  <div
                    className={`${stat.color} w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4`}
                  >
                    {stat.icon}
                  </div>
                  <p className="text-gray-500 text-sm">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Revenue Chart */}
              <div className="bg-white rounded-2xl shadow p-6">
                <h3 className="font-bold text-gray-800 mb-4">
                  📈 Revenue (Last 6 Months)
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={dashboard.revenueByMonth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      tickFormatter={(v) => `₹${v / 1000}k`}
                    />
                    <Tooltip
                      formatter={(value) => [
                        `₹${value.toLocaleString()}`,
                        "Revenue",
                      ]}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#7C3AED"
                      strokeWidth={3}
                      dot={{ fill: "#7C3AED", strokeWidth: 2, r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Orders Pie Chart */}
              <div className="bg-white rounded-2xl shadow p-6">
                <h3 className="font-bold text-gray-800 mb-4">
                  🥧 Orders by Status
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={[
                        {
                          name: "Pending",
                          value: dashboard.ordersByStatus.pending,
                          fill: "#FCD34D",
                        },
                        {
                          name: "Paid",
                          value: dashboard.ordersByStatus.paid,
                          fill: "#34D399",
                        },
                        {
                          name: "Shipped",
                          value: dashboard.ordersByStatus.shipped,
                          fill: "#60A5FA",
                        },
                        {
                          name: "Delivered",
                          value: dashboard.ordersByStatus.delivered,
                          fill: "#7C3AED",
                        },
                        {
                          name: "Failed",
                          value: dashboard.ordersByStatus.failed,
                          fill: "#F87171",
                        },
                      ].filter((d) => d.value > 0)}
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Products */}
              <div className="bg-white rounded-2xl shadow p-6">
                <h3 className="font-bold text-gray-800 mb-4">
                  🏆 Top Selling Products
                </h3>
                {dashboard.topProducts.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <p className="text-3xl mb-2">📦</p>
                    <p>No sales data yet</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={dashboard.topProducts} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis type="number" tick={{ fontSize: 11 }} />
                      <YAxis
                        dataKey="name"
                        type="category"
                        tick={{ fontSize: 11 }}
                        width={100}
                      />
                      <Tooltip />
                      <Bar
                        dataKey="sales"
                        fill="#7C3AED"
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* New Users */}
              <div className="bg-white rounded-2xl shadow p-6">
                <h3 className="font-bold text-gray-800 mb-4">
                  👥 New Users (Last 6 Months)
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={dashboard.usersByMonth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="users" fill="#6366F1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* ── PRODUCTS ── */}
        {activeTab === "products" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800">Products 📦</h1>
              <button
                onClick={() => {
                  setShowAddProduct(true);
                  setForm({
                    name: "",
                    description: "",
                    price: "",
                    category: "",
                    stock: "",
                    image: "",
                  });
                }}
                className="bg-purple-600 text-white px-4 py-2 rounded-xl hover:bg-purple-700 transition font-semibold"
              >
                + Add Product
              </button>
            </div>
            <div className="bg-white rounded-2xl shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {[
                      "Image",
                      "Name",
                      "Category",
                      "Price",
                      "Stock",
                      "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-sm font-semibold text-gray-600"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.map((p) => (
                    <tr key={p._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        {p.image ? (
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            🛍️
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {p.name}
                      </td>
                      <td className="px-4 py-3">
                        <span className="bg-purple-100 text-purple-600 px-2 py-1 rounded-full text-xs">
                          {p.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-purple-600">
                        ₹{p.price}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`font-semibold ${
                            p.stock > 0 ? "text-green-500" : "text-red-500"
                          }`}
                        >
                          {p.stock}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditProduct(p);
                              setForm({
                                name: p.name,
                                description: p.description,
                                price: p.price,
                                category: p.category,
                                stock: p.stock,
                                image: p.image || "",
                              });
                            }}
                            className="bg-blue-100 text-blue-600 px-3 py-1 rounded-lg text-sm hover:bg-blue-200 transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p._id)}
                            className="bg-red-100 text-red-600 px-3 py-1 rounded-lg text-sm hover:bg-red-200 transition"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── ORDERS ── */}
        {activeTab === "orders" && (
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Orders 🧾</h1>
            <div className="bg-white rounded-2xl shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {[
                      "Order ID",
                      "Customer",
                      "Amount",
                      "Status",
                      "Date",
                      "Action",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-sm font-semibold text-gray-600"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map((o) => (
                    <tr key={o._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-xs text-gray-400 font-mono">
                        #{o._id.slice(-6).toUpperCase()}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800">
                          {o.user?.name}
                        </p>
                        <p className="text-xs text-gray-400">{o.user?.email}</p>
                      </td>
                      <td className="px-4 py-3 font-semibold text-purple-600">
                        ₹{o.totalAmount}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold
                          ${
                            o.status === "paid"
                              ? "bg-green-100 text-green-600"
                              : o.status === "pending"
                              ? "bg-yellow-100 text-yellow-600"
                              : o.status === "shipped"
                              ? "bg-blue-100 text-blue-600"
                              : o.status === "delivered"
                              ? "bg-purple-100 text-purple-600"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {o.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(o.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={o.status}
                          onChange={(e) =>
                            handleOrderStatus(o._id, e.target.value)
                          }
                          className="border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                        >
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="failed">Failed</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── USERS ── */}
        {activeTab === "users" && (
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Users 👥</h1>
            <div className="bg-white rounded-2xl shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {["Name", "Email", "Role", "Joined"].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-sm font-semibold text-gray-600"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {u.name?.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-800">
                            {u.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{u.email}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold
                          ${
                            u.role === "admin"
                              ? "bg-purple-100 text-purple-600"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddProduct && (
        <ProductForm
          form={form}
          onSubmit={handleAddProduct}
          onChange={handleFormChange}
          onCancel={() => {
            setShowAddProduct(false);
            setProductErrors({});
          }}
          title="Add New Product"
          errors={productErrors}
        />
      )}
      {editProduct && (
        <ProductForm
          form={form}
          onSubmit={handleEditProduct}
          onChange={handleFormChange}
          onCancel={() => {
            setEditProduct(null);
            setProductErrors({});
          }}
          title="Edit Product"
          errors={productErrors}
        />
      )}
    </div>
  );
}

export default AdminPanel;
