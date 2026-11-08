import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusCircle, Search, QrCode, Send, CheckCircle, Trash2 } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api/items';

export default function App() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedQR, setSelectedQR] = useState(null);
  const [formData, setFormData] = useState({
    itemName: '',
    category: 'Books',
    borrowerName: '',
    borrowerPhone: '',
    borrowerEmail: '',
    dueDate: '',
    notes: ''
  });

  useEffect(() => {
    fetchItems();
  }, [search]);

  const fetchItems = async () => {
    try {
      const res = await axios.get(`${API_BASE}?search=${search}`);
      setItems(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(API_BASE, formData);
      setFormData({
        itemName: '',
        category: 'Books',
        borrowerName: '',
        borrowerPhone: '',
        borrowerEmail: '',
        dueDate: '',
        notes: ''
      });
      fetchItems();
    } catch (err) {
      alert('Error saving item');
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Returned' ? 'Active' : 'Returned';
    await axios.patch(`${API_BASE}/${id}/status`, { status: newStatus });
    fetchItems();
  };

  const deleteItem = async (id) => {
    if (confirm('Delete this record?')) {
      await axios.delete(`${API_BASE}/${id}`);
      fetchItems();
    }
  };

  const getQRCode = async (id) => {
    const res = await axios.get(`${API_BASE}/${id}/qr`);
    setSelectedQR(res.data.qrCodeUrl);
  };

  const sendWhatsAppReminder = (item) => {
    const cleanPhone = item.borrowerPhone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `Hi ${item.borrowerName}, this is a reminder regarding the item "${item.itemName}" borrowed on ${new Date(item.borrowDate).toLocaleDateString()}. Please return it by ${new Date(item.dueDate).toLocaleDateString()}. Thank you!`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">LendTrack Sri Lanka</h1>
            <p className="text-sm text-slate-500">Track loans, equipment, and send automated return reminders.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Item Registration Form */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-fit">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-indigo-600" /> Log New Borrowed Item
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                placeholder="Item Name"
                required
                className="w-full p-2 border rounded-lg text-sm"
                value={formData.itemName}
                onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
              />
              <select
                className="w-full p-2 border rounded-lg text-sm bg-white"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="Books">Books</option>
                <option value="Equipment">Equipment</option>
                <option value="Electronics">Electronics</option>
                <option value="Tools">Tools</option>
                <option value="Other">Other</option>
              </select>
              <input
                type="text"
                placeholder="Borrower Name"
                required
                className="w-full p-2 border rounded-lg text-sm"
                value={formData.borrowerName}
                onChange={(e) => setFormData({ ...formData, borrowerName: e.target.value })}
              />
              <input
                type="text"
                placeholder="Phone (e.g., +94771234567)"
                required
                className="w-full p-2 border rounded-lg text-sm"
                value={formData.borrowerPhone}
                onChange={(e) => setFormData({ ...formData, borrowerPhone: e.target.value })}
              />
              <input
                type="date"
                required
                className="w-full p-2 border rounded-lg text-sm"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
              <textarea
                placeholder="Notes / Serial No."
                className="w-full p-2 border rounded-lg text-sm"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
              <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition">
                Add Loan Record
              </button>
            </form>
          </div>

          {/* Borrowed Inventory Table */}
          <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100 space-y-4">
            <div className="flex justify-between items-center gap-4">
              <h2 className="text-lg font-semibold text-slate-800">Active & Past Loans</h2>
              <div className="relative w-64">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search item or borrower..."
                  className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-medium">
                  <tr>
                    <th className="p-3">Item</th>
                    <th className="p-3">Borrower</th>
                    <th className="p-3">Due Date</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50">
                      <td className="p-3">
                        <div className="font-medium text-slate-800">{item.itemName}</div>
                        <div className="text-xs text-slate-400">{item.category}</div>
                      </td>
                      <td className="p-3">
                        <div>{item.borrowerName}</div>
                        <div className="text-xs text-slate-400">{item.borrowerPhone}</div>
                      </td>
                      <td className="p-3">
                        {new Date(item.dueDate).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          item.status === 'Returned' ? 'bg-emerald-100 text-emerald-700' :
                          new Date(item.dueDate) < new Date() ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {item.status === 'Returned' ? 'Returned' : new Date(item.dueDate) < new Date() ? 'Overdue' : 'Active'}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-2">
                        <button onClick={() => sendWhatsAppReminder(item)} title="Send WhatsApp Reminder" className="p-1 text-emerald-600 hover:bg-emerald-50 rounded">
                          <Send className="w-4 h-4" />
                        </button>
                        <button onClick={() => getQRCode(item._id)} title="View QR Code" className="p-1 text-indigo-600 hover:bg-indigo-50 rounded">
                          <QrCode className="w-4 h-4" />
                        </button>
                        <button onClick={() => toggleStatus(item._id, item.status)} title="Toggle Status" className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button onClick={() => deleteItem(item._id)} title="Delete Record" className="p-1 text-rose-600 hover:bg-rose-50 rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* QR Modal */}
      {selectedQR && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-sm w-full text-center space-y-4">
            <h3 className="text-lg font-bold text-slate-800">Asset Tag QR Code</h3>
            <img src={selectedQR} alt="QR Code" className="mx-auto w-48 h-48" />
            <button 
              onClick={() => setSelectedQR(null)}
              className="w-full bg-slate-800 text-white py-2 rounded-lg text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}