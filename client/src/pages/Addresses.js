import React, { useState, useEffect } from 'react';
import { getAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress } from '../services/api';
import toast from 'react-hot-toast';

const emptyForm = {
  fullName: '', phone: '', addressLine1: '',
  addressLine2: '', city: '', state: '', pincode: '', isDefault: false
};

function Addresses() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadAddresses(); }, []);

  const loadAddresses = async () => {
    try {
      const res = await getAddresses();
      setAddresses(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!form.phone.trim()) newErrors.phone = 'Phone is required';
    else if (!/^[0-9]{10}$/.test(form.phone)) newErrors.phone = 'Enter valid 10 digit phone';
    if (!form.addressLine1.trim()) newErrors.addressLine1 = 'Address is required';
    if (!form.city.trim()) newErrors.city = 'City is required';
    if (!form.state.trim()) newErrors.state = 'State is required';
    if (!form.pincode.trim()) newErrors.pincode = 'Pincode is required';
    else if (!/^[0-9]{6}$/.test(form.pincode)) newErrors.pincode = 'Enter valid 6 digit pincode';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      if (editId) {
        await updateAddress(editId, form);
        toast.success('Address updated! ✅');
      } else {
        await addAddress(form);
        toast.success('Address added! ✅');
      }
      setShowForm(false);
      setEditId(null);
      setForm(emptyForm);
      loadAddresses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save address');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (address) => {
    setEditId(address._id);
    setForm({
      fullName: address.fullName,
      phone: address.phone,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || '',
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      isDefault: address.isDefault
    });
    setShowForm(true);
    setErrors({});
  };

  const handleDelete = async (id) => {
    toast((t) => (
      <div className="flex flex-col gap-2">
        <p className="font-semibold">Delete this address?</p>
        <div className="flex gap-2">
          <button onClick={async () => {
            toast.dismiss(t.id);
            try {
              await deleteAddress(id);
              toast.success('Address deleted!');
              loadAddresses();
            } catch (err) {
              toast.error('Failed to delete');
            }
          }} className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm">Delete</button>
          <button onClick={() => toast.dismiss(t.id)}
            className="border border-gray-300 px-3 py-1 rounded-lg text-sm">Cancel</button>
        </div>
      </div>
    ), { duration: 10000 });
  };

  const handleSetDefault = async (id) => {
    try {
      await setDefaultAddress(id);
      toast.success('Default address updated!');
      loadAddresses();
    } catch (err) {
      toast.error('Failed to update');
    }
  };

  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Delhi', 'Jammu and Kashmir', 'Ladakh'
  ];

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-purple-600"></div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">📍 My Addresses</h1>
        {!showForm && (
          <button onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm); setErrors({}); }}
            className="bg-purple-600 text-white px-4 py-2 rounded-xl hover:bg-purple-700 transition font-semibold">
            + Add Address
          </button>
        )}
      </div>

      {/* Address Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            {editId ? 'Edit Address' : 'Add New Address'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Full Name */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Full Name</label>
              <input type="text" placeholder="Enter full name"
                value={form.fullName}
                onChange={(e) => { setForm({ ...form, fullName: e.target.value }); setErrors({ ...errors, fullName: '' }); }}
                className={`w-full border rounded-xl px-4 py-2 focus:outline-none focus:ring-2
                  ${errors.fullName ? 'border-red-400 focus:ring-red-200' : 'border-gray-300 focus:ring-purple-400'}`}
              />
              {errors.fullName && <p className="text-red-500 text-xs mt-1">⚠️ {errors.fullName}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Phone Number</label>
              <input type="tel" placeholder="10 digit mobile number"
                value={form.phone}
                onChange={(e) => { setForm({ ...form, phone: e.target.value }); setErrors({ ...errors, phone: '' }); }}
                className={`w-full border rounded-xl px-4 py-2 focus:outline-none focus:ring-2
                  ${errors.phone ? 'border-red-400 focus:ring-red-200' : 'border-gray-300 focus:ring-purple-400'}`}
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">⚠️ {errors.phone}</p>}
            </div>

            {/* Address Line 1 */}
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-gray-700 mb-1 block">Address Line 1</label>
              <input type="text" placeholder="House no, Building, Street"
                value={form.addressLine1}
                onChange={(e) => { setForm({ ...form, addressLine1: e.target.value }); setErrors({ ...errors, addressLine1: '' }); }}
                className={`w-full border rounded-xl px-4 py-2 focus:outline-none focus:ring-2
                  ${errors.addressLine1 ? 'border-red-400 focus:ring-red-200' : 'border-gray-300 focus:ring-purple-400'}`}
              />
              {errors.addressLine1 && <p className="text-red-500 text-xs mt-1">⚠️ {errors.addressLine1}</p>}
            </div>

            {/* Address Line 2 */}
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-gray-700 mb-1 block">Address Line 2 (optional)</label>
              <input type="text" placeholder="Area, Colony, Landmark"
                value={form.addressLine2}
                onChange={(e) => setForm({ ...form, addressLine2: e.target.value })}
                className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>

            {/* City */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">City</label>
              <input type="text" placeholder="Enter city"
                value={form.city}
                onChange={(e) => { setForm({ ...form, city: e.target.value }); setErrors({ ...errors, city: '' }); }}
                className={`w-full border rounded-xl px-4 py-2 focus:outline-none focus:ring-2
                  ${errors.city ? 'border-red-400 focus:ring-red-200' : 'border-gray-300 focus:ring-purple-400'}`}
              />
              {errors.city && <p className="text-red-500 text-xs mt-1">⚠️ {errors.city}</p>}
            </div>

            {/* State */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">State</label>
              <select value={form.state}
                onChange={(e) => { setForm({ ...form, state: e.target.value }); setErrors({ ...errors, state: '' }); }}
                className={`w-full border rounded-xl px-4 py-2 focus:outline-none focus:ring-2
                  ${errors.state ? 'border-red-400 focus:ring-red-200' : 'border-gray-300 focus:ring-purple-400'}`}>
                <option value="">Select State</option>
                {indianStates.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {errors.state && <p className="text-red-500 text-xs mt-1">⚠️ {errors.state}</p>}
            </div>

            {/* Pincode */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Pincode</label>
              <input type="text" placeholder="6 digit pincode"
                value={form.pincode}
                onChange={(e) => { setForm({ ...form, pincode: e.target.value }); setErrors({ ...errors, pincode: '' }); }}
                className={`w-full border rounded-xl px-4 py-2 focus:outline-none focus:ring-2
                  ${errors.pincode ? 'border-red-400 focus:ring-red-200' : 'border-gray-300 focus:ring-purple-400'}`}
              />
              {errors.pincode && <p className="text-red-500 text-xs mt-1">⚠️ {errors.pincode}</p>}
            </div>

            {/* Default checkbox */}
            <div className="flex items-center gap-2">
              <input type="checkbox" id="isDefault"
                checked={form.isDefault}
                onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                className="w-4 h-4 accent-purple-600"
              />
              <label htmlFor="isDefault" className="text-sm text-gray-700 cursor-pointer">
                Set as default address
              </label>
            </div>

            {/* Buttons */}
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" disabled={saving}
                className="flex-1 bg-purple-600 text-white py-3 rounded-xl hover:bg-purple-700
                  transition font-semibold disabled:opacity-60">
                {saving ? 'Saving...' : editId ? 'Update Address' : 'Save Address'}
              </button>
              <button type="button"
                onClick={() => { setShowForm(false); setEditId(null); setErrors({}); }}
                className="flex-1 border border-gray-300 py-3 rounded-xl hover:bg-gray-50 transition">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Address List */}
      {addresses.length === 0 && !showForm ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow">
          <p className="text-5xl mb-4">📍</p>
          <p className="text-gray-500 text-lg">No addresses yet</p>
          <button onClick={() => setShowForm(true)}
            className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-xl hover:bg-purple-700 transition">
            Add Your First Address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map(address => (
            <div key={address._id}
              className={`bg-white rounded-2xl shadow p-5 border-2 transition
                ${address.isDefault ? 'border-purple-500' : 'border-transparent'}`}>

              {/* Header */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🏠</span>
                  <p className="font-bold text-gray-800">{address.fullName}</p>
                </div>
                {address.isDefault && (
                  <span className="bg-purple-100 text-purple-600 text-xs px-2 py-1 rounded-full font-semibold">
                    Default
                  </span>
                )}
              </div>

              {/* Details */}
              <div className="text-gray-600 text-sm space-y-1">
                <p>{address.addressLine1}</p>
                {address.addressLine2 && <p>{address.addressLine2}</p>}
                <p>{address.city}, {address.state} - {address.pincode}</p>
                <p>📞 {address.phone}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-4">
                {!address.isDefault && (
                  <button onClick={() => handleSetDefault(address._id)}
                    className="flex-1 bg-purple-50 text-purple-600 py-2 rounded-xl text-sm
                      font-semibold hover:bg-purple-100 transition">
                    Set Default
                  </button>
                )}
                <button onClick={() => handleEdit(address)}
                  className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-xl text-sm
                    font-semibold hover:bg-blue-100 transition">
                  Edit
                </button>
                <button onClick={() => handleDelete(address._id)}
                  className="bg-red-50 text-red-500 px-4 py-2 rounded-xl text-sm
                    hover:bg-red-100 transition">
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Addresses;