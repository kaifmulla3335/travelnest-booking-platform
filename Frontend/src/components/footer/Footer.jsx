import { Link } from 'react-router-dom';
import { Plane, MapPin, Mail, Phone, Instagram, Twitter, Facebook, Youtube } from 'lucide-react';
import useSiteStore from '../../store/siteStore';

const currentYear = new Date().getFullYear();

const Footer = () => {
  const { siteName, supportEmail, supportPhone } = useSiteStore();

  return (
  <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-400 mt-auto relative overflow-hidden">
    <div className="absolute top-0 left-1/4 w-64 h-64 bg-sky-600/8 rounded-full blur-3xl pointer-events-none" />
    <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-sky-500/6 rounded-full blur-3xl pointer-events-none" />

    <div className="relative max-w-7xl mx-auto px-5 pt-12 pb-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">

        {/* Brand */}
        <div className="sm:col-span-2 lg:col-span-1">
          <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold text-white mb-3">
            <Plane size={20} className="text-sky-400" /> {siteName}
          </Link>
          <p className="text-sm leading-relaxed text-slate-400 mb-5 max-w-xs">
            India's most trusted travel booking platform. We curate unforgettable journeys to destinations across the globe.
          </p>
          <div className="space-y-2 mb-5">
            {[
              [Mail,  supportEmail],
              [Phone, supportPhone],
              [MapPin,'Mumbai, Maharashtra, India'],
            ].map(([Icon, text]) => (
              <div key={text} className="flex items-center gap-2 text-xs text-slate-500">
                <Icon size={12} className="text-sky-500 flex-shrink-0" /> {text}
              </div>
            ))}
          </div>
          {/* Social icons */}
          <div className="flex gap-2.5">
            {[Instagram, Twitter, Facebook, Youtube].map((Icon) => (
              <a key={Icon.displayName} href="#"
                className="w-8 h-8 rounded-lg bg-slate-700/60 hover:bg-sky-500 flex items-center justify-center text-slate-400 hover:text-white transition-all duration-200">
                <Icon size={14} />
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
            <span className="w-4 h-0.5 bg-sky-500 rounded-full" /> Quick Links
          </h4>
          <ul className="space-y-2.5">
            {[['/', 'Home'],['/packages','Packages'],['/about','About Us'],['/contact','Contact']].map(([to, label]) => (
              <li key={to}>
                <Link to={to} className="text-sm text-slate-400 hover:text-sky-400 transition-colors flex items-center gap-1.5 group">
                  <span className="w-0 group-hover:w-2 h-0.5 bg-sky-400 rounded-full transition-all duration-200" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Categories */}
        <div>
          <h4 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
            <span className="w-4 h-0.5 bg-sky-500 rounded-full" /> Categories
          </h4>
          <ul className="space-y-2.5">
            {['Beach Tours','Mountain Trek','Cultural Tours','Adventure','Wildlife','Luxury'].map(c => (
              <li key={c}>
                <span className="text-sm text-slate-400 hover:text-sky-400 transition-colors cursor-pointer flex items-center gap-1.5 group">
                  <span className="w-0 group-hover:w-2 h-0.5 bg-sky-400 rounded-full transition-all duration-200" />
                  {c}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Support */}
        <div>
          <h4 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
            <span className="w-4 h-0.5 bg-sky-500 rounded-full" /> Support
          </h4>
          <ul className="space-y-2.5">
            {['FAQ','Privacy Policy','Terms of Service','Cancellation Policy','Refund Policy'].map(c => (
              <li key={c}>
                <span className="text-sm text-slate-400 hover:text-sky-400 transition-colors cursor-pointer flex items-center gap-1.5 group">
                  <span className="w-0 group-hover:w-2 h-0.5 bg-sky-400 rounded-full transition-all duration-200" />
                  {c}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Shine divider */}
      <div className="relative h-px mb-6 overflow-hidden rounded-full">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-sky-500/50 to-transparent" />
        <div className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent"
          style={{animation:'shimmer 2.5s linear infinite'}} />
      </div>

      {/* Copyright — centered only */}
      <p className="text-center text-xs text-slate-500">
        © {currentYear} {siteName}. All rights reserved.
      </p>
    </div>

    <style>{`
      @keyframes shimmer {
        0%   { transform: translateX(-150%); }
        100% { transform: translateX(450%); }
      }
    `}</style>
  </footer>
  );
};

export default Footer;