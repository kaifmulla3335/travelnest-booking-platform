import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Globe, Eye, EyeOff, CheckCircle, X } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import useSiteStore from '../../store/siteStore';

const RegisterPage = () => {
  const { handleRegister, loading, error } = useAuth();
  const { siteName } = useSiteStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', password: '', confirm: ''
  });
  const [show, setShow]       = useState(false);
  const [showC, setShowC]     = useState(false);
  const [success, setSuccess] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return;
    if (form.phone && form.phone.length !== 10) return;

    // Prefix +91 before sending to backend
    const payload = {
      ...form,
      phone: form.phone ? `+91${form.phone}` : '',
    };

    try {
      await handleRegister(payload); // This internally navigates to /login
    } catch {
      // error is shown via useAuth error state
    }
  };

  // Password strength
  const pwd = form.password;
  const strength = pwd.length === 0 ? 0
    : pwd.length < 6 ? 1
    : pwd.length < 10 ? 2
    : /[A-Z]/.test(pwd) && /[0-9]/.test(pwd) ? 4
    : 3;

  const strengthLabel = ['', 'Too short', 'Fair', 'Good', 'Strong'];
  const strengthColor = ['', 'bg-red-400', 'bg-amber-400', 'bg-sky-400', 'bg-green-500'];
  const strengthText  = ['', 'text-red-500', 'text-amber-500', 'text-sky-500', 'text-green-600'];

  const passwordsMatch = form.confirm && form.password === form.confirm;
  const passwordsMismatch = form.confirm && form.password !== form.confirm;

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-md">
        <div className="glass-card p-8 md:p-10">

          {/* Header */}
          <div className="text-center mb-7">
            <div className="w-14 h-14 bg-sky-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Globe size={28} className="text-sky-500" />
            </div>
            <h2 className="font-display text-2xl font-bold text-slate-800">Create Account</h2>
            <p className="text-slate-400 text-sm mt-1">Join {siteName} and start your journey</p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-5">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">

            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">First Name *</label>
                <input name="firstName" required placeholder="Aarav"
                  value={form.firstName} onChange={onChange} className="form-input" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Last Name *</label>
                <input name="lastName" required placeholder="Kumar"
                  value={form.lastName} onChange={onChange} className="form-input" />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email Address *</label>
              <input name="email" type="email" required placeholder="you@example.com"
                value={form.email} onChange={onChange} className="form-input" />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Phone Number</label>
              <div className="flex">
                <span className="flex items-center px-3 border border-r-0 border-slate-200 rounded-l-xl bg-slate-50 text-slate-500 text-sm font-medium select-none">
                  +91
                </span>
                <input
                  name="phone"
                  type="tel"
                  inputMode="numeric"
                  placeholder="98765 43210"
                  maxLength={10}
                  value={form.phone}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setForm(f => ({ ...f, phone: digits }));
                  }}
                  className="form-input rounded-l-none flex-1"
                />
              </div>
              {form.phone && form.phone.length !== 10 && (
                <p className="text-xs text-red-500 mt-1">Phone number must be 10 digits</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Password *</label>
              <div className="relative">
                <input name="password" type={show ? 'text' : 'password'} required
                  placeholder="Min. 6 characters"
                  value={form.password} onChange={onChange} className="form-input pr-10" />
                <button type="button" onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {show ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {/* Strength bar */}
              {pwd.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1,2,3,4].map(i => (
                      <div key={i} className={`flex-1 h-1 rounded-full transition-colors duration-300
                        ${i <= strength ? strengthColor[strength] : 'bg-slate-200'}`} />
                    ))}
                  </div>
                  <p className={`text-xs font-medium ${strengthText[strength]}`}>
                    {strengthLabel[strength]}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Confirm Password *</label>
              <div className="relative">
                <input name="confirm" type={showC ? 'text' : 'password'} required
                  placeholder="Repeat your password"
                  value={form.confirm} onChange={onChange}
                  className={`form-input pr-10 ${passwordsMismatch ? 'border-red-300 focus:border-red-400' : ''} ${passwordsMatch ? 'border-green-400' : ''}`} />
                <button type="button" onClick={() => setShowC(!showC)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showC ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {passwordsMismatch && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <X size={11} /> Passwords do not match
                </p>
              )}
              {passwordsMatch && (
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <CheckCircle size={11} /> Passwords match
                </p>
              )}
            </div>

            <button type="submit"
              disabled={loading || passwordsMismatch || !form.password}
              className="btn-primary w-full py-3 rounded-xl text-sm disabled:opacity-60 flex items-center justify-center gap-2 mt-2">
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Creating Account...</>
              ) : 'Create My Account 🚀'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-sky-500 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;