import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Plane, CheckCircle } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import useSiteStore from '../../store/siteStore';

const LoginPage = () => {
  const { handleLogin, loading, error } = useAuth();
  const { siteName } = useSiteStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [show, setShow] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const location = useLocation();

  // Show success message if coming from register page
  useEffect(() => {
    if (location.state?.registered) {
      setSuccessMsg('Account created successfully! Please log in.');
    }
  }, [location.state]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const onSubmit = (e) => { e.preventDefault(); handleLogin(form); };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-md">
        <div className="glass-card p-8 md:p-10">

          {/* Header */}
          <div className="text-center mb-7">
            <div className="w-14 h-14 bg-sky-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Plane size={28} className="text-sky-500" />
            </div>
            <h2 className="font-display text-2xl font-bold text-slate-800">Welcome Back!</h2>
            <p className="text-slate-400 text-sm mt-1">Log in to your {siteName} account</p>
          </div>

          {/* Success toast — from register */}
          {successMsg && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 mb-5 flex items-center gap-2">
              <CheckCircle size={15} className="text-green-500 flex-shrink-0" />
              {successMsg}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-5">
              ⚠️ {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email Address</label>
              <input name="email" type="email" required placeholder="you@example.com"
                value={form.email} onChange={onChange} className="form-input" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Password</label>
              <div className="relative">
                <input name="password" type={show ? 'text' : 'password'} required
                  placeholder="••••••••" value={form.password} onChange={onChange}
                  className="form-input pr-10" />
                <button type="button" onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div className="text-right mt-1.5">
                <span className="text-xs text-sky-500 cursor-pointer font-medium hover:underline">
                  Forgot password?
                </span>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full py-3 rounded-xl text-sm mt-1 disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Logging in...</>
              ) : `Login to ${siteName}`}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-sky-500 font-semibold hover:underline">Sign up free</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;