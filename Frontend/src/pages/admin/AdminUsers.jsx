import { useState, useEffect } from 'react';
import { Search, Eye, Shield, User, Loader2, X } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
const getToken = () => localStorage.getItem('tn_token');

const AdminUsers = () => {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [filter,  setFilter]  = useState('All');
  const [detail,  setDetail]  = useState(null);

  useEffect(() => {
    fetch(`${API}/admin/users`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    })
      .then(r => r.json())
      .then(data => setUsers(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(u => {
    const matchFilter = filter === 'All'
      || (filter === 'ADMIN' && u.role === 'ADMIN')
      || (filter === 'USER'  && u.role === 'USER');
    const matchSearch = !search
      || u.name?.toLowerCase().includes(search.toLowerCase())
      || u.email?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const admins = users.filter(u => u.role === 'ADMIN').length;

  const metrics = [
    { label: 'Total Users', val: users.length,            color: 'text-sky-600',    bg: 'bg-sky-50'    },
    { label: 'Active',      val: users.length - admins,   color: 'text-green-600',  bg: 'bg-green-50'  },
    { label: 'Admins',      val: admins,                  color: 'text-violet-600', bg: 'bg-violet-50' },
  ];

  if (loading) return (
    <div className="flex items-center justify-center py-20 gap-3 text-slate-400">
      <Loader2 size={20} className="animate-spin" /> Loading users...
    </div>
  );

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-slate-800">Manage Users</h2>
        <p className="text-slate-400 text-sm mt-0.5">{users.length} registered users</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {metrics.map(m => (
          <div key={m.label} className={`${m.bg} border border-slate-100 rounded-2xl p-4`}>
            <div className={`font-display text-2xl font-bold ${m.color}`}>{m.val}</div>
            <div className="text-xs text-slate-500 mt-0.5">{m.label}</div>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="form-input pl-9 text-sm w-full" />
        </div>
        <div className="flex gap-2">
          {['All','USER','ADMIN'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all
                ${filter === f ? 'bg-sky-500 text-white border-sky-500' : 'bg-white text-slate-500 border-slate-200 hover:border-sky-300'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>{['User','Email','Phone','Role','Joined','Action'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-slate-400 text-xs uppercase font-semibold tracking-wide">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-slate-400">No users found</td></tr>
              ) : filtered.map(u => (
                <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-white text-xs font-bold flex-shrink-0
                        ${u.role === 'ADMIN' ? 'bg-gradient-to-br from-violet-400 to-violet-600' : 'bg-gradient-to-br from-sky-400 to-sky-600'}`}>
                        {u.profileImage
                          ? <img src={u.profileImage} alt={u.name} className="w-full h-full object-cover" />
                          : u.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <span className="font-medium text-slate-800 text-sm">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{u.email}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{u.phone || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full
                      ${u.role === 'ADMIN' ? 'bg-violet-100 text-violet-700' : 'bg-sky-100 text-sky-700'}`}>
                      {u.role === 'ADMIN' ? <Shield size={10} /> : <User size={10} />}
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN') : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => setDetail(u)}
                      className="p-1.5 rounded-lg hover:bg-sky-50 text-slate-400 hover:text-sky-500 transition-colors">
                      <Eye size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDetail(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-lg font-bold text-slate-800">User Details</h3>
              <button onClick={() => setDetail(null)} className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400">
                <X size={16} />
              </button>
            </div>
            <div className="flex flex-col items-center mb-5">
              <div className={`w-14 h-14 rounded-full overflow-hidden flex items-center justify-center text-white text-xl font-bold mb-3
                ${detail.role === 'ADMIN' ? 'bg-gradient-to-br from-violet-400 to-violet-600' : 'bg-gradient-to-br from-sky-400 to-sky-600'}`}>
                {detail.profileImage
                  ? <img src={detail.profileImage} alt={detail.name} className="w-full h-full object-cover" />
                  : detail.name?.charAt(0)?.toUpperCase()}
              </div>
              <p className="font-display font-bold text-slate-800">{detail.name}</p>
              <p className="text-slate-400 text-xs">{detail.email}</p>
            </div>
            <div className="space-y-3 text-sm">
              {[
                ['Phone',   detail.phone || '—'],
                ['Role',    detail.role],
                ['Joined',  detail.createdAt ? new Date(detail.createdAt).toLocaleDateString('en-IN') : '—'],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between border-b border-slate-50 pb-2">
                  <span className="text-slate-400">{label}</span>
                  <span className="font-semibold text-slate-800">{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;