import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getProfile, updateProfile, getMyOrders } from '../services/api';
import { useWishlist } from '../context/WishlistContext';
import toast from 'react-hot-toast';

function Profile() {
  const { user, login } = useAuth();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [nameForm, setNameForm] = useState({ name: '' });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '', newPassword: '', confirmPassword: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    Promise.all([getProfile(), getMyOrders()])
      .then(([profileRes, ordersRes]) => {
        setProfile(profileRes.data);
        setNameForm({ name: profileRes.data.name });
        setOrders(ordersRes.data);
        setLoading(false);
      })
      .catch(err => { console.error(err); setLoading(false); });
  }, [user]);

  const handleUpdateName = async (e) => {
    e.preventDefault();
    if (!nameForm.name.trim()) { toast.error('Name cannot be empty'); return; }
    setSaving(true);
    try {
      const res = await updateProfile({ name: nameForm.name });
      login(res.data.user, localStorage.getItem('token'));
      setProfile(prev => ({ ...prev, name: res.data.user.name }));
      toast.success('Name updated! ✅');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match'); return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters'); return;
    }
    setSaving(true);
    try {
      await updateProfile({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      toast.success('Password updated! ✅');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-purple-600"></div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-white mb-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center
            text-purple-600 text-3xl font-bold shadow-lg">
            {profile?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{profile?.name}</h1>
            <p className="text-purple-200">{profile?.email}</p>
            <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm mt-2 inline-block">
              {profile?.role === 'admin' ? '👑 Admin' : '👤 Customer'}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          {[
            { label: 'Total Orders', value: orders.length, icon: '📦' },
            { label: 'Wishlist Items', value: wishlist.length, icon: '❤️' },
            { label: 'Member Since', value: new Date(profile?.createdAt).getFullYear(), icon: '📅' }
          ].map(stat => (
            <div key={stat.label} className="bg-white bg-opacity-20 rounded-xl p-4 text-center">
              <p className="text-2xl">{stat.icon}</p>
              <p className="text-2xl font-bold mt-1">{stat.value}</p>
              <p className="text-purple-200 text-xs">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {['profile', 'password'].map(tab => (
          <button key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-full font-medium transition
              ${activeTab === tab
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-600 border border-gray-300 hover:border-purple-400'}`}>
            {tab === 'profile' ? '👤 Edit Profile' : '🔒 Change Password'}
          </button>
        ))}
      </div>

      {/* Edit Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Edit Profile</h2>
          <form onSubmit={handleUpdateName} className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Full Name</label>
              <input
                type="text"
                value={nameForm.name}
                onChange={(e) => setNameForm({ name: e.target.value })}
                className="w-full border border-gray-300 rounded-xl px-4 py-3
                  focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
              <input
                type="email"
                value={profile?.email}
                disabled
                className="w-full border border-gray-200 rounded-xl px-4 py-3
                  bg-gray-50 text-gray-400 cursor-not-allowed"
              />
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
            </div>
            <button type="submit" disabled={saving}
              className="bg-purple-600 text-white py-3 rounded-xl hover:bg-purple-700
                transition font-semibold disabled:opacity-60 w-full">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      )}

      {/* Change Password Tab */}
      {activeTab === 'password' && (
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Change Password</h2>
          <form onSubmit={handleUpdatePassword} className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Current Password</label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                placeholder="Enter current password"
                className="w-full border border-gray-300 rounded-xl px-4 py-3
                  focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">New Password</label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                placeholder="Min 6 characters"
                className="w-full border border-gray-300 rounded-xl px-4 py-3
                  focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Confirm New Password</label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                placeholder="Re-enter new password"
                className="w-full border border-gray-300 rounded-xl px-4 py-3
                  focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
            <button type="submit" disabled={saving}
              className="bg-purple-600 text-white py-3 rounded-xl hover:bg-purple-700
                transition font-semibold disabled:opacity-60 w-full">
              {saving ? 'Updating...' : 'Update Password 🔒'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Profile;