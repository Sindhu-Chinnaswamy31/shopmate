import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/api";
import { useAuth } from "../context/AuthContext";

function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const validate = () => {
    const newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "Name is required";
    } else if (form.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    } else if (!/(?=.*[0-9])/.test(form.password)) {
      newErrors.password = "Password must contain at least one number";
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    // Clear error on typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setLoading(true);
    try {
      const res = await registerUser({
        name: form.name,
        email: form.email,
        password: form.password,
      });
      login(res.data.user, res.data.token);
      navigate("/");
    } catch (err) {
      setErrors({ api: err.response?.data?.message || "Registration failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Create Account 🚀
          </h2>
          <p className="text-gray-400 text-sm mt-1">Join ShopMate today!</p>
        </div>

        {errors.api && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm">
            ❌ {errors.api}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Name */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={form.name}
              onChange={handleChange}
              className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 transition
                ${
                  errors.name
                    ? "border-red-400 focus:ring-red-200"
                    : "border-gray-300 focus:ring-purple-300"
                }`}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">⚠️ {errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Email
            </label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 transition
                ${
                  errors.email
                    ? "border-red-400 focus:ring-red-200"
                    : "border-gray-300 focus:ring-purple-300"
                }`}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">⚠️ {errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="Min 6 chars with a number"
              value={form.password}
              onChange={handleChange}
              className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 transition
                ${
                  errors.password
                    ? "border-red-400 focus:ring-red-200"
                    : "border-gray-300 focus:ring-purple-300"
                }`}
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">⚠️ {errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Re-enter your password"
              value={form.confirmPassword}
              onChange={handleChange}
              className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 transition
                ${
                  errors.confirmPassword
                    ? "border-red-400 focus:ring-red-200"
                    : "border-gray-300 focus:ring-purple-300"
                }`}
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">
                ⚠️ {errors.confirmPassword}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-purple-600 text-white py-3 rounded-xl hover:bg-purple-700 transition font-semibold mt-2 disabled:opacity-60"
          >
            {loading ? "⏳ Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-gray-500 mt-4 text-sm">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-purple-600 font-semibold hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
