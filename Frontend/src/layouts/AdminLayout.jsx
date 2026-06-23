import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import useSiteStore from '../store/siteStore';
import {
  Plane, LayoutDashboard, Package, Users,
  BookOpen, DollarSign, Settings, LogOut, Menu, X
} from 'lucide-react';

const LINKS = [
  { to:'/admin',          icon:LayoutDashboard, label:'Dashboard',        end:true  },
  { to:'/admin/packages', icon:Package,         label:'Manage Packages'           },
  { to:'/admin/users',    icon:Users,           label:'Manage Users'              },
  { to:'/admin/bookings', icon:BookOpen,        label:'Manage Bookings'           },
  { to:'/admin/revenue',  icon:DollarSign,      label:'Revenue'                   },
  { to:'/admin/settings', icon:Settings,        label:'Settings'                  },
];

const AdminLayout = () => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { siteName } = useSiteStore();

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 py-5 border-b border-white/20">
        <Plane size={20} className="text-white" />
        <span className="font-display text-lg font-bold text-white">{siteName}</span>
        <span className="text-xs font-body font-normal text-white/50 ml-1">Admin</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 overflow-y-auto">
        {LINKS.map(({ to, icon: Icon, label, end }) => (
          <NavLink key={to} to={to} end={end}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-5 py-3 text-sm font-medium transition-all border-l-4
               ${isActive
                 ? 'bg-white/18 text-white border-white'
                 : 'text-white/70 border-transparent hover:bg-white/10 hover:text-white'}`
            }>
            <Icon size={17} /> {label}
          </NavLink>
        ))}
      </nav>

      {/* Exit */}
      <button onClick={() => navigate('/')}
        className="flex items-center gap-3 px-5 py-4 text-white/60 hover:text-white text-sm border-t border-white/20 transition-colors w-full">
        <LogOut size={17} /> Exit Admin
      </button>
    </>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">

      {/* Desktop Sidebar — stays fixed; only <main> below scrolls */}
      <aside className="w-60 bg-gradient-to-b from-sky-700 to-sky-500 flex-shrink-0 hidden md:flex flex-col h-full">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-64 bg-gradient-to-b from-sky-700 to-sky-500 flex flex-col h-full shadow-2xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-200 flex-shrink-0">
          <button onClick={() => setMobileOpen(true)} className="p-1.5 rounded-lg hover:bg-slate-100">
            <Menu size={20} className="text-sky-600" />
          </button>
          <div className="flex items-center gap-2 font-display text-base font-bold text-sky-600">
            <Plane size={18} /> {siteName} Admin
          </div>
        </div>

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;