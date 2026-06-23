import { useEffect, useRef, useState } from 'react';
import useSiteStore from '../../store/siteStore';
import { useNavigate } from 'react-router-dom';

// ── Count-up hook — same as HomePage ──
const useCountUp = (target, duration = 1800, isFloat = false) => {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true); },
      { threshold: 0.4 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const realTarget = isFloat ? target * 10 : target;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // easeOutQuart
      const eased = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(eased * realTarget));
      if (progress < 1) requestAnimationFrame(step);
      else setCount(realTarget);
    };
    requestAnimationFrame(step);
  }, [started, target, duration, isFloat]);

  return { count, ref };
};
import {
  Target, Globe, Star, Users, Clock, Award,
  MapPin, Mail, Phone, ArrowRight, CheckCircle
} from 'lucide-react';

// ── Count-up hook (same as HomePage) ──────────────────────
const useCounter = (target, duration = 1800) => {
  const [count, setCount] = useState(0);
  const ref               = useRef(null);
  const started           = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const startTime = performance.now();

          const tick = (now) => {
            const elapsed  = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(eased * target));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return { count, ref };
};

// ── Stat card with count-up ────────────────────────────────
const StatCard = ({ icon: Icon, val, label, color, bg, suffix = '', isFloat = false }) => {
  // For float: animate 0→49 then display as x/10 = 0.0→4.9
  const numTarget = isFloat ? 49 : parseInt(val);
  const { count, ref } = useCounter(numTarget, 1800);
  const display = isFloat ? (count / 10).toFixed(1) : count;

  return (
    <div ref={ref} className="glass-card p-4 sm:p-6 flex flex-col items-center text-center">
      <div className={`w-10 h-10 sm:w-12 sm:h-12 ${bg} rounded-xl flex items-center justify-center mb-3`}>
        <Icon size={20} className={color} />
      </div>
      <div className={`font-display text-xl sm:text-2xl font-bold ${color} tabular-nums`}>
        {display}{suffix}
      </div>
      <div className="text-xs sm:text-sm text-slate-500 mt-1 leading-snug">{label}</div>
    </div>
  );
};

// ── Data ──────────────────────────────────────────────────
const STATS = [
  { icon: Globe, val: '500', suffix: '+',  label: 'Destinations covered',    color: 'text-sky-500',    bg: 'bg-sky-50'    },
  { icon: Clock, val: '15',  suffix: '+',  label: 'Years of trusted service', color: 'text-amber-500', bg: 'bg-amber-50'  },
  { icon: Users, val: '50',  suffix: 'K+', label: 'Happy travelers',          color: 'text-green-500',  bg: 'bg-green-50'  },
  { icon: Award, val: '4.9', suffix: '/5', label: 'Average rating', isFloat: true, color: 'text-violet-500', bg: 'bg-violet-50' },
];

const TEAM = [
  { name: 'Rohan Mehta',  role: 'Founder & CEO',       initials: 'RM', color: 'from-sky-400 to-sky-600'       },
  { name: 'Priya Sharma', role: 'Head of Operations',   initials: 'PS', color: 'from-green-400 to-emerald-600' },
  { name: 'Arjun Kapoor', role: 'Lead Travel Curator',  initials: 'AK', color: 'from-violet-400 to-purple-600' },
  { name: 'Sneha Nair',   role: 'Customer Experience',  initials: 'SN', color: 'from-amber-400 to-orange-500'  },
];

const VALUES = [
  { icon: CheckCircle, title: 'Transparency', desc: 'No hidden fees, no surprises. What you see is what you get.' },
  { icon: Star,        title: 'Excellence',   desc: 'Every package is curated to deliver exceptional experiences.' },
  { icon: Users,       title: 'People First', desc: 'Your satisfaction and safety are always our top priority.'   },
];

// ── Page ──────────────────────────────────────────────────
const AboutPage = () => {
  const navigate = useNavigate();
  const { siteName } = useSiteStore();

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-br from-sky-50 to-white px-4 sm:px-5 pt-10 sm:pt-16 pb-8 sm:pb-12 text-center border-b border-sky-100">
        <span className="inline-block bg-sky-100 text-sky-600 rounded-full px-4 py-1 text-xs font-bold uppercase tracking-wide mb-3">
          Our Story
        </span>
        <h1 className="font-display text-2xl sm:text-4xl font-bold text-slate-800 mb-2 sm:mb-3">
          About {siteName}
        </h1>
        <p className="text-slate-500 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
          Our story, mission & the team behind your perfect journeys
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-5 py-8 sm:py-14 space-y-10 sm:space-y-16">

        {/* Mission */}
        <div className="glass-card p-5 sm:p-8">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 bg-sky-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Target size={18} className="text-sky-500" />
            </div>
            <h2 className="font-display text-lg sm:text-2xl font-bold text-slate-800">Our Mission</h2>
          </div>
          <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
            {siteName} was founded with one simple belief — travel should be accessible, enjoyable, and hassle-free for everyone. We curate the best destinations, negotiate the best prices, and ensure every traveler gets a world-class experience.
          </p>
          <div className="mt-4 pt-4 border-t border-sky-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {VALUES.map(v => (
              <div key={v.title} className="flex items-start gap-2.5">
                <v.icon size={15} className="text-sky-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-slate-700">{v.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Animated Stats ── */}
        <div>
          <h2 className="font-display text-lg sm:text-2xl font-bold text-slate-800 mb-4 sm:mb-6 text-center">
            {siteName} by the Numbers
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-5">
            {STATS.map(s => <StatCard key={s.label} {...s} />)}
          </div>
        </div>

        {/* Team */}
        <div>
          <h2 className="font-display text-lg sm:text-2xl font-bold text-slate-800 mb-1 text-center">
            Meet the Team
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm text-center mb-5 sm:mb-6">
            The passionate people making your travels unforgettable
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {TEAM.map(t => (
              <div key={t.name} className="glass-card p-4 sm:p-5 text-center">
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white font-bold text-sm sm:text-base mx-auto mb-3`}>
                  {t.initials}
                </div>
                <p className="font-semibold text-slate-800 text-xs sm:text-sm leading-snug">{t.name}</p>
                <p className="text-xs text-slate-400 mt-1 leading-snug">{t.role}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="glass-card p-6 sm:p-8 text-center"
          style={{background:'linear-gradient(135deg,rgba(14,165,233,0.08),rgba(2,132,199,0.05))'}}>
          <h3 className="font-display text-lg sm:text-xl font-bold text-slate-800 mb-2">
            Ready to Start Your Journey?
          </h3>
          <p className="text-slate-500 text-sm mb-5">Browse our handpicked travel packages and find your perfect getaway.</p>
          <button onClick={() => navigate('/packages')}
            className="btn-primary px-6 py-2.5 text-sm inline-flex items-center gap-2">
            Explore Packages <ArrowRight size={15} />
          </button>
        </div>

      </div>
    </div>
  );
};

export default AboutPage;