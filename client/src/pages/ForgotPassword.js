import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../services/api';
import toast from 'react-hot-toast';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) { toast.error('Enter your email'); return; }
    setLoading(true);
    try {
      await forgotPassword({ email });
      setSent(true);
      toast.success('Reset link sent to your email!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
        <div className="text-center mb-6">
          <p className="text-4xl mb-2">🔐</p>
          <h2 className="text-2xl font-bold text-gray-800">Forgot Password?</h2>
          <p className="text-gray-400 text-sm mt-1">
            Enter your email and we'll send a reset link
          </p>
        </div>

        {sent ? (
          <div className="text-center">
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-4">
              <p className="text-3xl mb-2">📧</p>
              <p className="text-green-700 font-semibold">Reset link sent!</p>
              <p className="text-green-600 text-sm mt-1">
                Check your email inbox and click the link to reset your password.
              </p>
            </div>
            <Link to="/login" className="text-purple-600 font-semibold hover:underline">
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
              <input
                type="email"
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3
                  focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
            <button type="submit" disabled={loading}
              className="bg-purple-600 text-white py-3 rounded-xl hover:bg-purple-700
                transition font-semibold disabled:opacity-60">
              {loading ? 'Sending...' : 'Send Reset Link 📧'}
            </button>
            <Link to="/login"
              className="text-center text-gray-500 text-sm hover:text-purple-600 transition">
              ← Back to Login
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;