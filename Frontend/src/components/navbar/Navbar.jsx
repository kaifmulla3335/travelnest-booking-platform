import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Menu, X, Plane, User, LayoutDashboard,
  Shield, LogOut, ChevronDown, Package, Phone
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useAuth from '../../hooks/useAuth';
import useSiteStore from '../../store/siteStore';

const NAV_LINKS = [
  { to:'/',         label:'Home'     },
  { to:'/packages', label:'Packages' },
  { to:'/about',    label:'About'    },
  { to:'/contact',  label:'Contact'  },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen]     = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { isLoggedIn, user }            = useAuthStore();
  const { handleLogout }                = useAuth();
  const { siteName }                    = useSiteStore();
  const navigate                        = useNavigate();
  const location                        = useLocation();
  const dropRef                         = useRef(null);
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    const h = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropdownOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const go = (path) => { setDropdownOpen(false); setMobileOpen(false); navigate(path); };

  const isActive = (to) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);

  return (
    <>
      <nav className="sticky top-0 z-50 glass border-b border-sky-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-5 flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold text-sky-600 flex-shrink-0">
            <Plane size={22} /> <span>{siteName}</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(l => (
              <Link key={l.to} to={l.to}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all
                  ${isActive(l.to) ? 'text-sky-600 bg-sky-50' : 'text-slate-600 hover:text-sky-600 hover:bg-sky-50'}`}>
                {l.label}
              </Link>
            ))}
            {isLoggedIn && isAdmin && (
              <Link to="/admin"
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5
                  ${location.pathname.startsWith('/admin') ? 'text-violet-600 bg-violet-50' : 'text-slate-600 hover:text-violet-600 hover:bg-violet-50'}`}>
                <Shield size={14} /> Admin Panel
              </Link>
            )}
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            {!isLoggedIn && (
              <div className="hidden md:flex items-center gap-3">
                <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-sky-600 transition-colors">Login</Link>
                <Link to="/register" className="btn-primary text-sm px-5 py-2">Sign Up</Link>
              </div>
            )}

            {isLoggedIn && (
              <div className="relative hidden md:block" ref={dropRef}>
                <button onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-sky-200 hover:border-sky-400 hover:bg-sky-50 transition-all">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold
                    ${isAdmin ? 'bg-gradient-to-br from-violet-400 to-violet-600' : 'bg-gradient-to-br from-sky-400 to-sky-600'}`}>
                    {user?.profileImage ? <img src={user.profileImage} alt='avatar' className='w-full h-full object-cover rounded-full' /> : (user?.name?.charAt(0)?.toUpperCase() || 'U')}
                  </div>
                  <span className="text-sm font-medium text-slate-700 max-w-[90px] truncate">{user?.name?.split(' ')[0]}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isAdmin ? 'bg-violet-100 text-violet-700' : 'bg-sky-100 text-sky-700'}`}>
                    {user?.role}
                  </span>
                  <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-12 w-56 glass-card py-2 rounded-xl shadow-xl border border-sky-100">
                    <div className="px-4 py-3 border-b border-sky-100 mb-1">
                      <p className="text-sm font-semibold text-slate-800 truncate">{user?.name}</p>
                      <p className="text-xs text-slate-400 truncate mb-2">{user?.email}</p>
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full
                        ${isAdmin ? 'bg-violet-100 text-violet-700' : 'bg-sky-100 text-sky-700'}`}>
                        {isAdmin ? <><Shield size={10} /> Administrator</> : <><User size={10} /> User</>}
                      </span>
                    </div>
                    {isAdmin
                      ? <DropItem icon={<Shield size={15}/>} label="Admin Dashboard" active={location.pathname.startsWith('/admin')} onClick={() => go('/admin')} />
                      : <DropItem icon={<LayoutDashboard size={15}/>} label="My Dashboard" active={location.pathname === '/dashboard'} onClick={() => go('/dashboard')} />
                    }
                    <DropItem icon={<User size={15}/>} label="My Profile" active={location.pathname === '/profile'} onClick={() => go('/profile')} />
                    <div className="border-t border-sky-100 mt-1 pt-1">
                      <DropItem icon={<LogOut size={15}/>} label="Logout" onClick={() => { handleLogout(); setDropdownOpen(false); }} danger />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Hamburger */}
            <button onClick={() => setMobileOpen(true)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-sky-50 transition-colors">
              <Menu size={22} className="text-sky-600" />
            </button>
          </div>
        </div>
      </nav>

      {/* ── MOBILE MENU — Full screen premium overlay ── */}
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition-all duration-300
          ${mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        style={{background:'rgba(0,0,0,0.55)', backdropFilter:'blur(6px)'}}
        onClick={() => setMobileOpen(false)}
      />

      {/* Slide-in panel */}
      <div className={`fixed top-0 right-0 bottom-0 z-50 md:hidden w-[78vw] max-w-xs
        bg-white shadow-2xl flex flex-col
        transition-transform duration-300 ease-out
        ${mobileOpen ? 'translate-x-0' : 'translate-x-full'}`}>

        {/* Panel header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <Link to="/" onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2 font-display text-lg font-bold text-sky-600">
            <Plane size={18} /> <span>{siteName}</span>
          </Link>
          <button onClick={() => setMobileOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors">
            <X size={18} className="text-slate-600" />
          </button>
        </div>

        {/* User info strip — if logged in */}
        {isLoggedIn && (
          <div className={`mx-4 mt-4 rounded-2xl p-4 flex items-center gap-3
            ${isAdmin ? 'bg-violet-50 border border-violet-100' : 'bg-sky-50 border border-sky-100'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0
              ${isAdmin ? 'bg-gradient-to-br from-violet-400 to-violet-600' : 'bg-gradient-to-br from-sky-400 to-sky-600'}`}>
              {user?.profileImage ? <img src={user.profileImage} alt='avatar' className='w-full h-full object-cover rounded-full' /> : (user?.name?.charAt(0)?.toUpperCase() || 'U')}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-slate-800 text-sm truncate">{user?.name}</p>
              <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full mt-0.5
                ${isAdmin ? 'bg-violet-100 text-violet-700' : 'bg-sky-100 text-sky-700'}`}>
                {isAdmin ? '🛡️ Administrator' : '👤 Traveler'}
              </span>
            </div>
          </div>
        )}

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest px-3 mb-2">Menu</p>

          {NAV_LINKS.map(l => (
            <Link key={l.to} to={l.to} onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all
                ${isActive(l.to)
                  ? 'bg-sky-500 text-white shadow-sm shadow-sky-200'
                  : 'text-slate-600 hover:bg-slate-100'}`}>
              <span className="w-2 h-2 rounded-full bg-current opacity-60 flex-shrink-0" />
              {l.label}
            </Link>
          ))}

          {/* Logged in links */}
          {isLoggedIn && (
            <>
              <div className="pt-3 pb-1">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest px-3 mb-2">Account</p>
              </div>

              {isAdmin && (
                <button onClick={() => go('/admin')}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-violet-50 hover:text-violet-600 transition-all text-left">
                  <Shield size={16} className="text-violet-500 flex-shrink-0" /> Admin Panel
                </button>
              )}
              {!isAdmin && (
                <button onClick={() => go('/dashboard')}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-sky-50 hover:text-sky-600 transition-all text-left">
                  <LayoutDashboard size={16} className="text-sky-500 flex-shrink-0" /> My Dashboard
                </button>
              )}
              <button onClick={() => go('/profile')}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-sky-50 hover:text-sky-600 transition-all text-left">
                <User size={16} className="text-sky-500 flex-shrink-0" /> My Profile
              </button>
              <button onClick={() => go('/packages')}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-sky-50 hover:text-sky-600 transition-all text-left">
                <Package size={16} className="text-sky-500 flex-shrink-0" /> Browse Packages
              </button>
            </>
          )}
        </nav>

        {/* Bottom action area */}
        <div className="px-4 pb-6 pt-3 border-t border-slate-100 space-y-2">
          {isLoggedIn ? (
            <button onClick={() => { handleLogout(); setMobileOpen(false); }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-red-500 bg-red-50 hover:bg-red-100 transition-colors">
              <LogOut size={16} /> Sign Out
            </button>
          ) : (
            <div className="space-y-2">
              <Link to="/register" onClick={() => setMobileOpen(false)}
                className="w-full flex items-center justify-center btn-primary py-3 text-sm font-semibold rounded-xl">
                Sign Up — It's Free ✈️
              </Link>
              <Link to="/login" onClick={() => setMobileOpen(false)}
                className="w-full flex items-center justify-center py-3 rounded-xl text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
                Login
              </Link>
            </div>
          )}

          {/* Contact strip */}
          <div className="flex items-center justify-center gap-1.5 pt-2 text-xs text-slate-400">
            <Phone size={11} className="text-sky-400" />
            <span>+91 98765 43210</span>
          </div>
        </div>
      </div>
    </>
  );
};

const DropItem = ({ icon, label, onClick, danger, active }) => (
  <button onClick={onClick}
    className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left transition-colors
      ${danger ? 'text-red-500 hover:bg-red-50'
        : active ? 'bg-sky-50 text-sky-600 font-medium'
        : 'text-slate-600 hover:bg-sky-50 hover:text-sky-700'}`}>
    {icon} {label}
    {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-sky-500" />}
  </button>
);

export default Navbar;