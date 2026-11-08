import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import './App.css';
import {
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  CheckCircle,
  ClipboardList,
  Clock3,
  LayoutDashboard,
  Menu,
  PackagePlus,
  QrCode,
  Search,
  Send,
  Trash2,
  X,
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api/items';
const EMPTY_FORM = {
  itemName: '',
  category: 'Books',
  borrowerName: '',
  borrowerPhone: '',
  borrowerEmail: '',
  dueDate: '',
  notes: '',
};

const formatDate = (date) =>
  date ? new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

const isOverdue = (item) => item.status !== 'Returned' && new Date(item.dueDate) < new Date();

export default function App() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedQR, setSelectedQR] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [today] = useState(() => formatDate(new Date()));

  const fetchItems = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}?search=${encodeURIComponent(search)}`);
      setItems(res.data);
    } catch (err) {
      console.error(err);
    }
  }, [search]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const stats = useMemo(() => ({
    total: items.length,
    active: items.filter((item) => item.status !== 'Returned' && !isOverdue(item)).length,
    overdue: items.filter(isOverdue).length,
    returned: items.filter((item) => item.status === 'Returned').length,
  }), [items]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await axios.post(API_BASE, formData);
      setFormData(EMPTY_FORM);
      fetchItems();
    } catch (err) {
      console.error(err);
      alert('Unable to save this loan record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'Returned' ? 'Active' : 'Returned';
      await axios.patch(`${API_BASE}/${id}/status`, { status: newStatus });
      fetchItems();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteItem = async (id) => {
    if (!confirm('Delete this record?')) return;
    try {
      await axios.delete(`${API_BASE}/${id}`);
      fetchItems();
    } catch (err) {
      console.error(err);
    }
  };

  const getQRCode = async (id) => {
    try {
      const res = await axios.get(`${API_BASE}/${id}/qr`);
      setSelectedQR(res.data.qrCodeUrl);
    } catch (err) {
      console.error(err);
    }
  };

  const sendWhatsAppReminder = (item) => {
    const cleanPhone = item.borrowerPhone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `Hi ${item.borrowerName}, this is a reminder regarding "${item.itemName}". Please return it by ${formatDate(item.dueDate)}. Thank you!`,
    );
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark"><BookOpen size={20} /></div>
          <span>Lend<span>Track</span></span>
        </div>
        <nav className="side-nav">
          <div className="nav-label">Workspace</div>
          <a className="nav-link active" href="#dashboard"><LayoutDashboard size={18} /> Dashboard</a>
          <a className="nav-link" href="#loans"><ClipboardList size={18} /> All loans <span>{stats.total}</span></a>
          <a className="nav-link" href="#overdue"><Clock3 size={18} /> Overdue <span className="alert-count">{stats.overdue}</span></a>
        </nav>
        <div className="sidebar-bottom">
          <div className="tip-card">
            <div className="tip-icon"><ArrowUpRight size={17} /></div>
            <strong>Keep it moving</strong>
            <p>Send a friendly reminder before a loan becomes overdue.</p>
          </div>
          <div className="sidebar-footer">LendTrack v1.0 <span>•</span> Sri Lanka</div>
        </div>
      </aside>

      <main className="main-content" id="dashboard">
        <header className="topbar">
          <button className="mobile-menu" aria-label="Open menu"><Menu size={21} /></button>
          <div className="breadcrumb"><span>Workspace</span><strong>/</strong><b>Dashboard</b></div>
          <div className="profile"><div className="avatar">SA</div><span>My workspace</span></div>
        </header>

        <div className="content-wrap">
          <section className="welcome-row">
            <div>
              <p className="eyebrow">OVERVIEW</p>
              <h1>Good morning, Savindu <span>✦</span></h1>
              <p className="subtitle">Keep every item accounted for, effortlessly.</p>
            </div>
            <div className="date-chip"><CalendarDays size={16} /> {today}</div>
          </section>

          <section className="stats-grid" aria-label="Loan summary">
            <StatCard label="Total items" value={stats.total} icon={<PackagePlus size={19} />} tone="purple" />
            <StatCard label="Currently lent" value={stats.active} icon={<Clock3 size={19} />} tone="blue" />
            <StatCard label="Need attention" value={stats.overdue} icon={<ArrowUpRight size={19} />} tone="orange" />
            <StatCard label="Returned" value={stats.returned} icon={<CheckCircle size={19} />} tone="green" />
          </section>

          <section className="workspace-grid">
            <div className="panel form-panel">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">NEW RECORD</p>
                  <h2>Add a loan</h2>
                </div>
                <div className="heading-icon purple"><PackagePlus size={20} /></div>
              </div>
              <p className="panel-intro">Record something you have lent out.</p>
              <form onSubmit={handleSubmit}>
                <label>Item name<input type="text" placeholder="e.g. Camera, book..." required value={formData.itemName} onChange={(e) => setFormData({ ...formData, itemName: e.target.value })} /></label>
                <div className="form-row">
                  <label>Category<select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}><option>Books</option><option>Equipment</option><option>Electronics</option><option>Tools</option><option>Other</option></select></label>
                  <label>Due date<input type="date" required value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} /></label>
                </div>
                <label>Borrower name<input type="text" placeholder="Who borrowed it?" required value={formData.borrowerName} onChange={(e) => setFormData({ ...formData, borrowerName: e.target.value })} /></label>
                <label>Phone number<input type="text" placeholder="+94 77 123 4567" required value={formData.borrowerPhone} onChange={(e) => setFormData({ ...formData, borrowerPhone: e.target.value })} /></label>
                <label>Notes <span className="optional">Optional</span><textarea rows="2" placeholder="Serial number or extra details..." value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} /></label>
                <button className="primary-button" type="submit" disabled={isSubmitting}><PackagePlus size={17} /> {isSubmitting ? 'Saving...' : 'Add loan record'}</button>
              </form>
            </div>

            <div className="panel loans-panel" id="loans">
              <div className="panel-heading loans-heading">
                <div><p className="eyebrow">YOUR ACTIVITY</p><h2>Recent loans</h2></div>
                <div className="loan-count">{items.length} records</div>
              </div>
              <div className="search-box"><Search size={17} /><input type="search" placeholder="Search loans..." value={search} onChange={(e) => setSearch(e.target.value)} /><kbd>⌘ K</kbd></div>
              <div className="loan-list">
                {items.length === 0 ? (
                  <div className="empty-state"><div className="empty-icon"><ClipboardList size={24} /></div><h3>No loans yet</h3><p>Add your first loan record to start tracking.</p></div>
                ) : items.map((item) => (
                  <LoanCard key={item._id} item={item} onReminder={sendWhatsAppReminder} onQR={getQRCode} onToggle={toggleStatus} onDelete={deleteItem} />
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>

      {selectedQR && <div className="modal-backdrop" onClick={() => setSelectedQR(null)}>
        <div className="qr-modal" onClick={(event) => event.stopPropagation()}>
          <button className="close-button" aria-label="Close QR code" onClick={() => setSelectedQR(null)}><X size={18} /></button>
          <div className="qr-badge"><QrCode size={18} /></div>
          <p className="eyebrow">ASSET TAG</p><h2>Scan to identify</h2>
          <img src={selectedQR} alt="QR code for loan item" />
          <p className="modal-caption">Use this QR code to quickly identify this item.</p>
          <button className="secondary-button" onClick={() => setSelectedQR(null)}>Close</button>
        </div>
      </div>}
    </div>
  );
}

function StatCard({ label, value, icon, tone }) {
  return <div className="stat-card"><div className={`stat-icon ${tone}`}>{icon}</div><div><p>{label}</p><strong>{value}</strong></div><div className={`stat-line ${tone}`} /></div>;
}

function LoanCard({ item, onReminder, onQR, onToggle, onDelete }) {
  const overdue = isOverdue(item);
  const status = item.status === 'Returned' ? 'Returned' : overdue ? 'Overdue' : 'Active';
  return <article className="loan-card">
    <div className={`item-icon ${item.category?.toLowerCase()}`}><BookOpen size={19} /></div>
    <div className="loan-main"><div className="item-title"><h3>{item.itemName}</h3><span className={`status ${status.toLowerCase()}`}>{status}</span></div><p className="category">{item.category}</p><div className="borrower"><div className="mini-avatar">{item.borrowerName?.charAt(0).toUpperCase()}</div><span>{item.borrowerName}</span><span className="dot">•</span><span className="due-date">Due {formatDate(item.dueDate)}</span></div></div>
    <div className="loan-actions">
      <button onClick={() => onReminder(item)} title="Send WhatsApp reminder"><Send size={16} /></button>
      <button onClick={() => onQR(item._id)} title="View QR code"><QrCode size={16} /></button>
      <button onClick={() => onToggle(item._id, item.status)} title="Toggle returned status"><CheckCircle size={16} /></button>
      <button className="danger" onClick={() => onDelete(item._id)} title="Delete record"><Trash2 size={16} /></button>
    </div>
  </article>;
}
