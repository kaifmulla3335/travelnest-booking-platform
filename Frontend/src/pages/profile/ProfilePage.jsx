import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Mail, Phone, Shield, Camera, Save,
  X, LogOut, LayoutDashboard, CheckCircle,
  Eye, EyeOff, Lock, Loader2, Edit3
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useAuth from '../../hooks/useAuth';
import axiosInstance from '../../api/axios';

const ProfilePage = () => {
  const { user, updateUser } = useAuthStore();
  const { handleLogout }     = useAuth();
  const navigate             = useNavigate();
  const isAdmin              = user?.role === 'ADMIN';
  const fileRef              = useRef(null);

  // ── Form state — always editable ──
  // Strip +91 prefix for editing — store only 10-digit number in form
  const stripPrefix = (p) => p?.replace(/^\+91/, '').replace(/\D/g, '').slice(0, 10) || '';

  const [form, setForm] = useState({
    name:  user?.name  || '',
    phone: stripPrefix(user?.phone),
  });
  const [saving,  setSaving]  = useState(false);
  const [changed, setChanged] = useState(false);

  // ── Avatar ──
  const [avatarPreview,  setAvatarPreview]  = useState(user?.profileImage || null);
  const [avatarFile,     setAvatarFile]     = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  // ── Password ──
  const [pwdForm,   setPwdForm]   = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdError,  setPwdError]  = useState('');
  const [showPwd,   setShowPwd]   = useState({ current: false, new: false, confirm: false });

  // ── Toast ──
  const [toast, setToast] = useState({ msg: '', type: '' });

  // ── Stats ──
  const [stats, setStats] = useState({ trips: 0, spent: 0 });

  useEffect(() => {
    axiosInstance.get('/bookings/my')
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : [];
        const confirmed = data.filter(b => b.status === 'CONFIRMED');
        setStats({
          trips: confirmed.length,
          spent: confirmed.reduce((s, b) => s + (b.totalAmount || 0), 0),
        });
      }).catch(() => {});
  }, []);

  const flash = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: '' }), 3500);
  };

  // Track changes
  const handleFormChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setChanged(true);
  };

  // Discard changes
  const handleDiscard = () => {
    setForm({ name: user?.name || '', phone: stripPrefix(user?.phone) });
    setAvatarPreview(user?.profileImage || null);
    setAvatarFile(null);
    setChanged(false);
  };

  // ── Avatar select ──
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target.result);
    reader.readAsDataURL(file);
    setChanged(true);
  };

  // ── Save Changes ──
  const handleSave = async () => {
    if (!form.name.trim()) return flash('Name cannot be empty', 'error');
    setSaving(true);
    try {
      let profileImage = user?.profileImage || null;

      // Upload avatar first if changed
      if (avatarFile) {
        setAvatarUploading(true);
        const fd = new FormData();
        fd.append('file', avatarFile);
        const imgRes = await axiosInstance.post('/user/upload-avatar', fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        profileImage = imgRes.data.imageUrl;
        setAvatarUploading(false);
      }

      // Update profile
      const res = await axiosInstance.put('/user/profile', {
        name:         form.name.trim(),
        phone:        form.phone ? `+91${form.phone}` : '',
        profileImage,
      });

      // Update Zustand — navbar + admin panel update
      updateUser({
        name:         res.data.name,
        phone:        res.data.phone,
        profileImage: res.data.profileImage,
      });

      setAvatarFile(null);
      setChanged(false);
      flash('Profile updated successfully!');
    } catch (err) {
      flash(err.response?.data?.message || 'Update failed. Try again.', 'error');
    } finally {
      setSaving(false);
      setAvatarUploading(false);
    }
  };

  // ── Change password ──
  const handleChangePassword = async () => {
    setPwdError('');
    if (!pwdForm.currentPassword) return setPwdError('Current password is required');
    if (pwdForm.newPassword.length < 6) return setPwdError('New password must be at least 6 characters');
    if (pwdForm.newPassword !== pwdForm.confirm) return setPwdError('Passwords do not match');
    if (pwdForm.currentPassword === pwdForm.newPassword) return setPwdError('New password must be different');

    setPwdSaving(true);
    try {
      await axiosInstance.put('/user/change-password', {
        currentPassword: pwdForm.currentPassword,
        newPassword:     pwdForm.newPassword,
      });
      setPwdForm({ currentPassword: '', newPassword: '', confirm: '' });
      flash('Password changed successfully!');
    } catch (err) {
      setPwdError(err.response?.data?.message || 'Incorrect current password');
    } finally {
      setPwdSaving(false);
    }
  };

  const pwd = pwdForm.newPassword;
  const strength = pwd.length === 0 ? 0 : pwd.length < 6 ? 1 : /[A-Z]/.test(pwd) && /[0-9]/.test(pwd) ? 4 : pwd.length < 10 ? 2 : 3;
  const strengthLabel = ['', 'Too short', 'Fair', 'Good', 'Strong'];
  const strengthColor = ['', 'bg-red-400', 'bg-amber-400', 'bg-sky-400', 'bg-green-500'];
  const strengthText  = ['', 'text-red-500', 'text-amber-500', 'text-sky-500', 'text-green-600'];

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-5 py-8 sm:py-10">

      {/* Page header + Save Changes */}
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-800">My Profile</h1>
          <p className="text-slate-400 text-sm mt-1">Manage your personal information & security</p>
        </div>

        {/* Save / Discard — always visible */}
        <div className="flex gap-2 flex-shrink-0">
          {changed && (
            <button onClick={handleDiscard} disabled={saving}
              className="flex items-center gap-1.5 border border-slate-200 text-slate-600 text-sm font-medium px-4 py-2 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50">
              <X size={14} /> Discard
            </button>
          )}
          <button onClick={handleSave} disabled={saving || !changed || (form.phone && form.phone.length !== 10)}
            className={`flex items-center gap-1.5 text-sm font-semibold px-5 py-2 rounded-xl transition-all
              ${changed
                ? 'bg-sky-500 hover:bg-sky-600 text-white shadow-md shadow-sky-200'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>
            {saving
              ? <><Loader2 size={14} className="animate-spin" /> Saving...</>
              : <><Save size={14} /> Save Changes</>}
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast.msg && (
        <div className={`mb-5 text-sm rounded-xl px-4 py-3 flex items-center gap-2
          ${toast.type === 'error'
            ? 'bg-red-50 border border-red-200 text-red-600'
            : 'bg-green-50 border border-green-200 text-green-700'}`}>
          {toast.type === 'error' ? '⚠️' : <CheckCircle size={15} />}
          {toast.msg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6 items-start">

        {/* ── LEFT: Avatar card ── */}
        <div className="glass-card p-5 flex flex-col items-center text-center">

          {/* Avatar with camera overlay */}
          <div className="relative mb-4 group">
            <div className={`w-24 h-24 rounded-full overflow-hidden flex items-center justify-center text-white text-2xl font-bold ring-4 ring-white shadow-lg
              ${isAdmin ? 'bg-gradient-to-br from-violet-400 to-violet-600' : 'bg-gradient-to-br from-sky-400 to-sky-600'}`}>
              {avatarPreview
                ? <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                : <span>{initials}</span>}
            </div>

            {/* Camera hover overlay */}
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute inset-0 rounded-full bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              {avatarUploading
                ? <Loader2 size={20} className="text-white animate-spin" />
                : <><Camera size={20} className="text-white" /><span className="text-white text-xs mt-1">Change</span></>}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>

          {/* Unsaved indicator */}
          {avatarFile && (
            <p className="text-xs text-amber-600 font-medium mb-2 bg-amber-50 px-2 py-1 rounded-full">
              📸 New photo — save to apply
            </p>
          )}

          <h2 className="font-display font-bold text-slate-800 text-base leading-snug">{user?.name}</h2>
          <p className="text-slate-400 text-xs mt-0.5 mb-3 truncate max-w-full px-2">{user?.email}</p>

          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full mb-4
            ${isAdmin ? 'bg-violet-100 text-violet-700' : 'bg-sky-100 text-sky-700'}`}>
            {isAdmin ? <Shield size={10} /> : <User size={10} />}
            {isAdmin ? 'Administrator' : 'Traveler'}
          </span>

          {/* Stats */}
          <div className="w-full grid grid-cols-2 gap-3 mb-5 pt-3 border-t border-sky-100">
            <div className="text-center">
              <div className="font-display text-xl font-bold text-sky-600">{stats.trips}</div>
              <div className="text-xs text-slate-400 mt-0.5">Trips</div>
            </div>
            <div className="text-center">
              <div className="font-display text-base font-bold text-sky-600">
                {stats.spent > 0 ? `₹${(stats.spent/1000).toFixed(0)}K` : '—'}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">Spent</div>
            </div>
          </div>

          <div className="w-full space-y-2">
            <button onClick={() => navigate(isAdmin ? '/admin' : '/dashboard')}
              className="w-full btn-outline py-2.5 text-sm rounded-xl flex items-center justify-center gap-2">
              {isAdmin ? <Shield size={14} /> : <LayoutDashboard size={14} />}
              {isAdmin ? 'Admin Panel' : 'Dashboard'}
            </button>
            <button onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 text-sm text-red-500 bg-red-50 hover:bg-red-100 border border-red-100 rounded-xl py-2.5 transition-colors">
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </div>

        {/* ── RIGHT ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Personal Information — always editable */}
          <div className="glass-card p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-5">
              <Edit3 size={15} className="text-sky-500" />
              <h3 className="font-semibold text-slate-800">Personal Information</h3>
              {changed && <span className="ml-auto text-xs text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded-full">Unsaved changes</span>}
            </div>

            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">
                  <User size={10} /> Full Name
                </label>
                <input name="name" value={form.name} onChange={handleFormChange}
                  className="form-input text-sm" placeholder="Your full name" />
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">
                  <Mail size={10} /> Email Address
                </label>
                <div className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-2.5 border border-slate-200">
                  <p className="text-slate-600 text-sm">{user?.email}</p>
                  <span className="text-xs text-slate-400">Cannot be changed</span>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">
                  <Phone size={10} /> Phone Number
                </label>
                <div className="flex">
                  <span className="flex items-center px-3 border border-r-0 border-slate-200 rounded-l-xl bg-slate-50 text-slate-500 text-sm font-medium select-none">
                    +91
                  </span>
                  <input
                    name="phone"
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={form.phone}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setForm(f => ({ ...f, phone: digits }));
                      setChanged(true);
                    }}
                    placeholder="98765 43210"
                    className="form-input text-sm rounded-l-none flex-1" />
                </div>
                {form.phone && form.phone.length !== 10 && (
                  <p className="text-xs text-red-500 mt-1">Phone number must be 10 digits</p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">
                  <Shield size={10} /> Account Role
                </label>
                <div className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium border
                  ${isAdmin ? 'bg-violet-50 text-violet-700 border-violet-100' : 'bg-sky-50 text-sky-700 border-sky-100'}`}>
                  {isAdmin ? <Shield size={14} /> : <User size={14} />}
                  {isAdmin ? 'Administrator' : 'Traveler — Standard account'}
                </div>
              </div>
            </div>
          </div>

          {/* Change Password */}
          <div className="glass-card p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-5">
              <Lock size={15} className="text-sky-500" />
              <h3 className="font-semibold text-slate-800">Change Password</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Current Password</label>
                <div className="relative">
                  <input type={showPwd.current ? 'text' : 'password'} placeholder="••••••••"
                    value={pwdForm.currentPassword}
                    onChange={e => setPwdForm(p => ({ ...p, currentPassword: e.target.value }))}
                    className="form-input text-sm pr-10" />
                  <button type="button" onClick={() => setShowPwd(p => ({ ...p, current: !p.current }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPwd.current ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">New Password</label>
                <div className="relative">
                  <input type={showPwd.new ? 'text' : 'password'} placeholder="Min. 6 characters"
                    value={pwdForm.newPassword}
                    onChange={e => setPwdForm(p => ({ ...p, newPassword: e.target.value }))}
                    className="form-input text-sm pr-10" />
                  <button type="button" onClick={() => setShowPwd(p => ({ ...p, new: !p.new }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPwd.new ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {pwd.length > 0 && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[1,2,3,4].map(i => (
                        <div key={i} className={`flex-1 h-1 rounded-full transition-colors duration-300
                          ${i <= strength ? strengthColor[strength] : 'bg-slate-200'}`} />
                      ))}
                    </div>
                    <p className={`text-xs font-medium ${strengthText[strength]}`}>{strengthLabel[strength]}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Confirm New Password</label>
                <div className="relative">
                  <input type={showPwd.confirm ? 'text' : 'password'} placeholder="Repeat new password"
                    value={pwdForm.confirm}
                    onChange={e => setPwdForm(p => ({ ...p, confirm: e.target.value }))}
                    className={`form-input text-sm pr-10
                      ${pwdForm.confirm && pwdForm.newPassword !== pwdForm.confirm ? 'border-red-300' : ''}
                      ${pwdForm.confirm && pwdForm.newPassword === pwdForm.confirm ? 'border-green-400' : ''}`} />
                  <button type="button" onClick={() => setShowPwd(p => ({ ...p, confirm: !p.confirm }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPwd.confirm ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {pwdForm.confirm && pwdForm.newPassword !== pwdForm.confirm && (
                  <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                )}
                {pwdForm.confirm && pwdForm.newPassword === pwdForm.confirm && (
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <CheckCircle size={11} /> Passwords match
                  </p>
                )}
              </div>

              {pwdError && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl px-3 py-2.5">
                  ⚠️ {pwdError}
                </div>
              )}

              <button onClick={handleChangePassword}
                disabled={pwdSaving || !pwdForm.currentPassword || !pwdForm.newPassword}
                className="btn-primary w-full py-2.5 text-sm rounded-xl flex items-center justify-center gap-2 disabled:opacity-60">
                {pwdSaving
                  ? <><Loader2 size={14} className="animate-spin" /> Changing...</>
                  : <><Lock size={14} /> Change Password</>}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProfilePage;