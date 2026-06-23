import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, CreditCard, Package, Loader2 } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
const getToken = () => localStorage.getItem('tn_token');

const BAR_COLORS = ['bg-sky-400','bg-sky-500','bg-sky-600','bg-indigo-400','bg-violet-400','bg-green-400','bg-amber-400','bg-rose-400'];

const AdminRevenue = () => {
  const [bookings, setBookings] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    const headers = { Authorization: `Bearer ${getToken()}` };
    Promise.all([
      fetch(`${API}/admin/bookings`, { headers }).then(r => r.json()),
      fetch(`${API}/packages`).then(r => r.json()),
    ]).then(([b, p]) => {
      setBookings(Array.isArray(b) ? b : []);
      setPackages(Array.isArray(p) ? p : []);
    }).finally(() => setLoading(false));
  }, []);

  const confirmed = bookings.filter(b => b.status === 'CONFIRMED');
  const totalRev  = confirmed.reduce((s, b) => s + (b.totalAmount || 0), 0);
  const avgVal    = confirmed.length ? Math.round(totalRev / confirmed.length) : 0;

  // Monthly revenue from real bookings
  const monthlyMap = {};
  confirmed.forEach(b => {
    if (!b.createdAt) return;
    const month = new Date(b.createdAt).toLocaleString('default', { month: 'short' });
    monthlyMap[month] = (monthlyMap[month] || 0) + (b.totalAmount || 0);
  });
  const monthlyData = Object.entries(monthlyMap).map(([month, revenue]) => ({ month, revenue }));

  // Top packages by revenue
  const pkgMap = {};
  confirmed.forEach(b => {
    const key = b.packageTitle;
    if (!pkgMap[key]) pkgMap[key] = { title: key, revenue: 0, count: 0 };
    pkgMap[key].revenue += b.totalAmount || 0;
    pkgMap[key].count   += 1;
  });
  const topPackages = Object.values(pkgMap).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  const maxRev = topPackages[0]?.revenue || 1;

  const maxMonthly = Math.max(...monthlyData.map(m => m.revenue), 1);

  const metrics = [
    { icon: DollarSign, label: 'Total Revenue',   val: `₹${(totalRev/100000).toFixed(1)}L`,           color: 'text-sky-500',   bg: 'bg-sky-50',   sub: 'All confirmed bookings' },
    { icon: TrendingUp, label: 'This Month',       val: `₹${((monthlyData.at(-1)?.revenue||0)/1000).toFixed(0)}K`, color: 'text-green-500', bg: 'bg-green-50', sub: 'Current month' },
    { icon: CreditCard, label: 'Avg Booking Value',val: `₹${avgVal.toLocaleString('en-IN')}`,          color: 'text-violet-500', bg: 'bg-violet-50', sub: 'Per booking' },
    { icon: Package,    label: 'Total Bookings',   val: bookings.length,                               color: 'text-amber-500', bg: 'bg-amber-50',  sub: 'All time' },
  ];

  if (loading) return (
    <div className="flex items-center justify-center py-20 gap-3 text-slate-400">
      <Loader2 size={20} className="animate-spin" /> Loading revenue data...
    </div>
  );

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-slate-800">Revenue Analytics</h2>
        <p className="text-slate-400 text-sm mt-0.5">Financial overview · Real booking data</p>
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

      {/* Monthly Chart */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm mb-5">
        <h3 className="font-semibold text-slate-800 mb-5">Monthly Revenue</h3>
        {monthlyData.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-sm">No booking data yet</div>
        ) : (
          <div className="flex items-end gap-3 h-44 overflow-x-auto pb-2">
            {monthlyData.map((m, i) => (
              <div key={m.month} className="flex flex-col items-center gap-1.5 flex-shrink-0 min-w-12">
                <span className="text-xs text-slate-400 font-medium">
                  ₹{m.revenue >= 100000 ? `${(m.revenue/100000).toFixed(1)}L` : `${Math.round(m.revenue/1000)}K`}
                </span>
                <div
                  className={`w-10 ${BAR_COLORS[i % BAR_COLORS.length]} rounded-t-lg transition-all duration-500`}
                  style={{ height: `${Math.max(8, (m.revenue / maxMonthly) * 140)}px` }}
                />
                <span className="text-xs text-slate-500">{m.month}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top Packages */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <h3 className="font-semibold text-slate-800 mb-4">Top Performing Packages</h3>
        {topPackages.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">No confirmed bookings yet</div>
        ) : (
          <div className="space-y-3">
            {topPackages.map((p, i) => (
              <div key={p.title} className="flex items-center gap-4">
                <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-600 text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-slate-700 truncate">{p.title}</span>
                    <div className="text-right flex-shrink-0 ml-2">
                      <span className="text-sm font-bold text-slate-800">₹{p.revenue.toLocaleString('en-IN')}</span>
                      <span className="text-xs text-green-500 ml-1">+{p.count === 1 ? '1 booking' : `${p.count} bookings`}</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-sky-400 to-sky-600 rounded-full transition-all duration-700"
                      style={{ width: `${(p.revenue / maxRev) * 100}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminRevenue;