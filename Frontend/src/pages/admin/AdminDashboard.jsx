import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, BookOpen, Users, Package, TrendingUp, Loader2 } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
const getToken = () => localStorage.getItem('tn_token');

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [packages, setPackages] = useState([]);
  const [users,    setUsers]    = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    const headers = { Authorization: `Bearer ${getToken()}` };
    Promise.all([
      fetch(`${API}/admin/bookings`, { headers }).then(r => r.json()),
      fetch(`${API}/packages`).then(r => r.json()),
      fetch(`${API}/admin/users`, { headers }).then(r => r.json()).catch(() => []),
    ]).then(([b, p, u]) => {
      setBookings(Array.isArray(b) ? b : []);
      setPackages(Array.isArray(p) ? p : []);
      setUsers(Array.isArray(u) ? u : []);
    }).finally(() => setLoading(false));
  }, []);

  const confirmed = bookings.filter(b => b.status === 'CONFIRMED');
  const revenue   = confirmed.reduce((s, b) => s + (b.totalAmount || 0), 0);
  const recent    = bookings.slice(0, 5);

  const metrics = [
    { icon: DollarSign, label: 'Total Revenue',    val: `₹${(revenue/100000).toFixed(1)}L`, color: 'text-sky-500',    bg: 'bg-sky-50',    sub: `${confirmed.length} confirmed` },
    { icon: BookOpen,   label: 'Total Bookings',   val: bookings.length,                    color: 'text-green-500',  bg: 'bg-green-50',  sub: `+${bookings.filter(b=>b.status==='PENDING').length} pending` },
    { icon: Users,      label: 'Registered Users', val: users.length || '—',               color: 'text-violet-500', bg: 'bg-violet-50', sub: 'All time' },
    { icon: Package,    label: 'Active Packages',  val: packages.length,                    color: 'text-amber-500',  bg: 'bg-amber-50',  sub: 'In catalog' },
  ];

  if (loading) return (
    <div className="flex items-center justify-center py-20 gap-3 text-slate-400">
      <Loader2 size={20} className="animate-spin" /> Loading dashboard...
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-800">Admin Dashboard</h2>
          <p className="text-slate-400 text-sm mt-0.5">Welcome back, Admin 👋</p>
        </div>
        <span className="text-xs text-slate-400">Last updated: just now</span>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {metrics.map(m => (
          <div key={m.label} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className={`w-10 h-10 ${m.bg} rounded-xl flex items-center justify-center mb-3`}>
              <m.icon size={20} className={m.color} />
            </div>
            <div className="font-display text-2xl font-bold text-slate-800">{m.val}</div>
            <div className="text-xs text-slate-400 mt-0.5">{m.label}</div>
            <div className={`text-xs font-medium mt-1 ${m.color}`}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Recent Bookings */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">Recent Bookings</h3>
          <button onClick={() => navigate('/admin/bookings')}
            className="text-sky-500 text-xs font-semibold hover:underline">
            View all →
          </button>
        </div>
        {recent.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">No bookings yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>{['Booking ID','Package','Date','Amount','Status'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-slate-400 text-xs uppercase font-semibold tracking-wide">{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {recent.map(b => (
                  <tr key={b.id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs text-sky-600 font-semibold">#{b.bookingRef}</td>
                    <td className="px-5 py-3.5 text-slate-700 font-medium text-xs">{b.packageTitle}</td>
                    <td className="px-5 py-3.5 text-slate-400 text-xs">{b.travelDate}</td>
                    <td className="px-5 py-3.5 font-semibold text-slate-800">₹{Number(b.totalAmount).toLocaleString('en-IN')}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={b.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;