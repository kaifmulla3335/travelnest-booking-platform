import { useState, useEffect, useRef, useCallback } from "react";
import useSiteStore from "../../store/siteStore";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Star,
  Users,
  Shield,
  CheckCircle,
  Award,
  HeartHandshake,
} from "lucide-react";
import PackageCard from "../../components/cards/PackageCard";
import PackageCardSkeleton from "../../components/cards/PackageCardSkeleton";
import { usePackages } from "../../hooks/usePackages";
import useAuthStore from "../../store/authStore";

import BeachImg from "../../assets/Categories/Beach.png";
import MountainImg from "../../assets/Categories/Mountain.png";
import CulturalImg from "../../assets/Categories/Cultural.png";
import AdventureImg from "../../assets/Categories/Adventure.png";
import WildlifeImg from "../../assets/Categories/Wildlife.png";
import LuxuryImg from "../../assets/Categories/Luxury.png";

const CATEGORIES = [
  {
    label: "Beach",
    img: BeachImg,
    count: 12,
    filter: "Beach",
    color: "from-sky-500/60 to-blue-700/70",
  },
  {
    label: "Mountain",
    img: MountainImg,
    count: 18,
    filter: "Mountain",
    color: "from-slate-500/60 to-slate-800/70",
  },
  {
    label: "Cultural",
    img: CulturalImg,
    count: 9,
    filter: "Cultural",
    color: "from-amber-500/60 to-orange-700/70",
  },
  {
    label: "Adventure",
    img: AdventureImg,
    count: 15,
    filter: "Adventure",
    color: "from-green-500/60 to-emerald-800/70",
  },
  {
    label: "Wildlife",
    img: WildlifeImg,
    count: 7,
    filter: "Wildlife",
    color: "from-orange-500/60 to-red-700/70",
  },
  {
    label: "Luxury",
    img: LuxuryImg,
    count: 6,
    filter: "Luxury",
    color: "from-violet-500/60 to-purple-800/70",
  },
];

const WHY_US = [
  {
    icon: <Shield size={28} />,
    gradient: "from-sky-400 to-sky-600",
    shadow: "shadow-sky-200",
    title: "Secure Booking",
    desc: "All payments secured via Razorpay with 256-bit SSL encryption. Your money is always safe.",
    stat: "100%",
    statLabel: "Payment Security",
  },
  {
    icon: <Award size={28} />,
    gradient: "from-amber-400 to-orange-500",
    shadow: "shadow-amber-200",
    title: "Curated Quality",
    desc: "Every package is hand-vetted by our expert travel team for the best experience.",
    stat: "500+",
    statLabel: "Verified Packages",
  },
  {
    icon: <HeartHandshake size={28} />,
    gradient: "from-green-400 to-emerald-600",
    shadow: "shadow-green-200",
    title: "24/7 Support",
    desc: "Round-the-clock assistance before, during, and after your trip. Always there for you.",
    stat: "< 2min",
    statLabel: "Avg Response Time",
  },
  {
    icon: <CheckCircle size={28} />,
    gradient: "from-violet-400 to-purple-600",
    shadow: "shadow-violet-200",
    title: "Best Price Guarantee",
    desc: "Found a cheaper deal elsewhere? We will match it — no questions asked.",
    stat: "50K+",
    statLabel: "Happy Travelers",
  },
];

const TESTIMONIALS = [
  {
    name: "Priya Rawat",
    loc: "Mumbai",
    initials: "PR",
    color: "from-sky-400 to-sky-600",
    rating: 5,
    text: "TravelNest made our Goa trip absolutely magical. From booking to return — everything was seamless and professional.",
  },
  {
    name: "Arjun Kapoor",
    loc: "Delhi",
    initials: "AK",
    color: "from-green-400 to-emerald-600",
    rating: 5,
    text: "Best Ladakh package we could find. The itinerary was perfectly planned and the team was super responsive throughout!",
  },
  {
    name: "Sneha Menon",
    loc: "Bengaluru",
    initials: "SM",
    color: "from-pink-400 to-rose-500",
    rating: 5,
    text: "Booked my Kerala honeymoon through TravelNest — the resort choices, houseboat, everything was five-star treatment.",
  },
  {
    name: "Rahul Sharma",
    loc: "Pune",
    initials: "RS",
    color: "from-violet-400 to-purple-600",
    rating: 5,
    text: "The Rajasthan heritage tour was beyond our expectations. Every detail was perfectly organized — truly a royal experience!",
  },
  {
    name: "Kavya Iyer",
    loc: "Chennai",
    initials: "KI",
    color: "from-teal-400 to-cyan-600",
    rating: 5,
    text: "Booked the Andaman trip for our anniversary. The snorkeling experience and beachside resort were absolutely stunning!",
  },
  {
    name: "Vikram Singh",
    loc: "Jaipur",
    initials: "VS",
    color: "from-amber-400 to-orange-500",
    rating: 5,
    text: "Spiti Valley trek was a life-changing experience. TravelNest handled everything perfectly — from permits to camping!",
  },
  {
    name: "Meera Nair",
    loc: "Kochi",
    initials: "MN",
    color: "from-emerald-400 to-green-600",
    rating: 5,
    text: "The Kerala backwaters houseboat was pure bliss. Woke up to misty green views every morning. Would book again in a heartbeat!",
  },
  {
    name: "Aditya Joshi",
    loc: "Hyderabad",
    initials: "AJ",
    color: "from-blue-400 to-indigo-600",
    rating: 5,
    text: "Manali snow adventure was thrilling! The ski lessons and Rohtang Pass trip were well-organized. Amazing memories!",
  },
];

// Duplicate for seamless infinite loop
const INFINITE_TESTIMONIALS = [...TESTIMONIALS, ...TESTIMONIALS];

// ── Animated counter hook ──
const useCounter = (target, duration = 1800, startOnVisible = true) => {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!startOnVisible) {
      setStarted(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [started, target, duration]);

  return { count, ref };
};

const STATS = [
  { target: 500, suffix: "+", label: "Destinations", prefix: "" },
  { target: 50, suffix: "K+", label: "Happy Travelers", prefix: "" },
  { target: 4.9, suffix: "★", label: "Avg Rating", prefix: "", isFloat: true },
  { target: 15, suffix: "+", label: "Years Trusted", prefix: "" },
];

const StatItem = ({ stat }) => {
  const { count, ref } = useCounter(stat.isFloat ? 49 : stat.target, 1800);
  const display = stat.isFloat ? (count / 10).toFixed(1) : count;
  return (
    <div ref={ref} className="text-center">
      {/* Divider line above on mobile grid */}
      <div className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-sky-600 tabular-nums leading-none">
        {stat.prefix}
        {display}
        {stat.suffix}
      </div>
      <div className="text-[11px] sm:text-xs text-slate-400 mt-1 font-medium">
        {stat.label}
      </div>
    </div>
  );
};

const HeroSection = ({
  navigate,
  search,
  setSearch,
  handleSearch,
  siteName,
}) => (
  <section className="relative min-h-[88vh] sm:min-h-[92vh] flex flex-col items-center justify-center px-4 sm:px-5 text-center overflow-hidden pt-6 sm:pt-0">
    {/* Background blobs */}
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute top-0 right-0 w-56 sm:w-80 md:w-[500px] h-56 sm:h-80 md:h-[500px] bg-sky-200/50 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-44 sm:w-64 md:w-96 h-44 sm:h-64 md:h-96 bg-sky-100/60 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />
    </div>

    <div className="relative z-10 max-w-3xl w-full">
      {/* ── Shine badge — compact on mobile ── */}
      <div className="inline-flex mb-4 sm:mb-6 cursor-default select-none">
        <div className="relative overflow-hidden bg-white/70 backdrop-blur-md border border-sky-200/80 rounded-full px-3 sm:px-5 py-1.5 sm:py-2 shadow-md shadow-sky-100/40">
          <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
            <div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/70 to-transparent -translate-x-full"
              style={{ animation: "badgeShine 2.5s ease-in-out infinite" }}
            />
          </div>
          <span className="relative flex items-center gap-1.5 text-sky-600 text-[11px] sm:text-xs font-semibold">
            <span style={{ animation: "starPulse 2s ease-in-out infinite" }}>
              ⭐
            </span>
            India's #1 Travel Platform
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
          </span>
        </div>
      </div>

      {/* ── Heading — tighter on mobile ── */}
      <h1
        className="font-display font-bold text-slate-800 leading-tight mb-3 sm:mb-5
        text-3xl sm:text-5xl md:text-6xl lg:text-7xl"
      >
        Discover Your Next
        <br />
        <span className="relative inline-block">
          <span
            className="bg-gradient-to-r from-sky-500 via-sky-400 to-blue-600 bg-clip-text text-transparent"
            style={{
              backgroundSize: "200% auto",
              animation: "gradShift 4s ease infinite",
            }}
          >
            Dream Destination
          </span>
          <span className="absolute -bottom-0.5 left-0 right-0 h-0.5 sm:h-1 bg-gradient-to-r from-sky-400/0 via-sky-400/60 to-sky-400/0 rounded-full" />
        </span>
      </h1>

      {/* ── Subtext — shorter on mobile ── */}
      <p className="text-slate-500 text-sm sm:text-base md:text-lg mb-6 sm:mb-8 leading-relaxed max-w-xl mx-auto px-2">
        From Himalayan peaks to tropical shores — {siteName} curates
        unforgettable journeys for every kind of traveler.
      </p>

      {/* ── Search bar — properly sized ── */}
      <form
        onSubmit={handleSearch}
        className="flex items-center bg-white/85 backdrop-blur-md border border-sky-200/80 rounded-full
          px-3 sm:px-5 py-1.5 sm:py-2
          max-w-sm sm:max-w-md mx-auto mb-8 sm:mb-12
          shadow-lg shadow-sky-100/50"
      >
        <Search size={15} className="text-slate-400 mr-2 flex-shrink-0" />
        <input
          type="text"
          placeholder="Search destinations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-transparent outline-none text-slate-700 text-sm placeholder-slate-400 min-w-0"
        />
        <button
          type="submit"
          className="flex-shrink-0 ml-2
            bg-gradient-to-r from-sky-500 to-sky-600
            text-white text-xs sm:text-sm font-semibold
            px-4 sm:px-5 py-2 sm:py-2.5
            rounded-full shadow-sm hover:shadow-md hover:scale-105
            transition-all duration-200 whitespace-nowrap"
        >
          Explore
        </button>
      </form>

      {/* ── Stats — 2x2 grid on small mobile, row on larger ── */}
      <div
        className="grid grid-cols-2 sm:flex sm:flex-wrap justify-center
        gap-4 sm:gap-x-10 md:gap-x-14
        px-4 sm:px-0"
      >
        {STATS.map((stat) => (
          <StatItem key={stat.label} stat={stat} />
        ))}
      </div>

      {/* Scroll hint — hide on very small screens */}
      <div className="hidden sm:flex mt-10 flex-col items-center gap-1.5 opacity-40">
        <span className="text-xs text-slate-400 font-medium">
          Scroll to explore
        </span>
        <div className="w-5 h-8 border-2 border-slate-300 rounded-full flex items-start justify-center pt-1.5">
          <div
            className="w-1 h-2 bg-slate-400 rounded-full"
            style={{ animation: "scrollDot 1.5s ease-in-out infinite" }}
          />
        </div>
      </div>
    </div>

    <style>{`
      @keyframes badgeShine {
        0%   { transform: translateX(-100%); }
        40%  { transform: translateX(300%); }
        100% { transform: translateX(300%); }
      }
      @keyframes starPulse {
        0%, 100% { transform: scale(1) rotate(0deg); }
        50%       { transform: scale(1.2) rotate(8deg); }
      }
      @keyframes scrollDot {
        0%, 100% { transform: translateY(0); opacity: 1; }
        50%       { transform: translateY(8px); opacity: 0.3; }
      }
      @keyframes gradShift {
        0%, 100% { background-position: 0% center; }
        50%       { background-position: 100% center; }
      }
    `}</style>
  </section>
);

const HomePage = () => {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { isLoggedIn } = useAuthStore();
  const { siteName } = useSiteStore();
  const { packages, loading } = usePackages();
  const featured = packages.slice(0, 6);
  const trackRef = useRef(null);

  // Auto-scroll testimonials
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let animId;
    let pos = 0;
    const speed = 0.5; // px per frame
    const cardWidth = 320 + 16; // card width + gap
    const halfWidth = cardWidth * TESTIMONIALS.length;

    const animate = () => {
      pos += speed;
      if (pos >= halfWidth) pos = 0;
      track.style.transform = `translateX(-${pos}px)`;
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);

    // Pause on hover
    const pause = () => cancelAnimationFrame(animId);
    const resume = () => {
      animId = requestAnimationFrame(animate);
    };
    track.addEventListener("mouseenter", pause);
    track.addEventListener("mouseleave", resume);

    return () => {
      cancelAnimationFrame(animId);
      track.removeEventListener("mouseenter", pause);
      track.removeEventListener("mouseleave", resume);
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(search.trim() ? `/packages?q=${search}` : "/packages");
  };

  const handleCTA = () => {
    // If already logged in → go to packages, not register
    navigate(isLoggedIn ? "/packages" : "/register");
  };

  return (
    <div>
      {/* ── HERO ── */}
      <HeroSection
        navigate={navigate}
        search={search}
        setSearch={setSearch}
        handleSearch={handleSearch}
        siteName={siteName}
      />

      {/* ── FEATURED PACKAGES ── */}
      <section className="px-4 sm:px-5 py-12 sm:py-16 max-w-7xl mx-auto">
        <div className="text-center mb-8 sm:mb-10">
          <span className="inline-block bg-sky-100 text-sky-600 rounded-full px-4 py-1 text-xs font-bold uppercase tracking-wide mb-3">
            Featured
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
            Handpicked Just For You
          </h2>
          <p className="text-slate-500 text-sm">
            Explore our most loved travel experiences
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <PackageCardSkeleton key={i} />
              ))
            : featured.map((pkg) => <PackageCard key={pkg.id} pkg={pkg} />)}
        </div>
        <div className="text-center mt-8">
          <button
            onClick={() => navigate("/packages")}
            className="btn-primary px-8 py-3 text-sm"
          >
            View All Packages →
          </button>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="bg-sky-50/50 py-12 sm:py-16 px-4 sm:px-5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-10">
            <span className="inline-block bg-sky-100 text-sky-600 rounded-full px-4 py-1 text-xs font-bold uppercase tracking-wide mb-3">
              Categories
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
              Travel Your Way
            </h2>
            <p className="text-slate-500 text-sm">
              Choose the adventure that suits your style
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.label}
                onClick={() => navigate(`/packages?cat=${cat.filter}`)}
                className="relative group overflow-hidden rounded-2xl cursor-pointer h-36 sm:h-40 md:h-44 shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300"
              >
                <img
                  src={cat.img}
                  alt={cat.label}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-0`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10 group-hover:from-black/75 transition-all duration-300" />
                <div className="absolute inset-0 flex flex-col items-center justify-end pb-3 sm:pb-4 px-2">
                  <span className="text-white font-display font-bold text-sm sm:text-base leading-tight drop-shadow-lg">
                    {cat.label}
                  </span>
                  <span className="text-white/75 text-xs mt-0.5 font-medium">
                    {cat.count} tours
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY US — Premium animated cards ── */}
      <section className="py-14 sm:py-20 px-4 sm:px-5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <span className="inline-block bg-sky-100 text-sky-600 rounded-full px-4 py-1 text-xs font-bold uppercase tracking-wide mb-3">
              Why Us
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
              Why {siteName}?
            </h2>
            <p className="text-slate-500 text-sm">
              Trusted by 50,000+ travelers across India
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {WHY_US.map((item, i) => (
              <div
                key={item.title}
                className="group relative bg-white rounded-2xl p-6 sm:p-7
                           border border-slate-100
                           shadow-lg hover:shadow-2xl
                           hover:-translate-y-2
                           transition-all duration-300 overflow-hidden"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {/* Background glow on hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-2xl`}
                />

                {/* Icon circle */}
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-white mb-5 shadow-lg ${item.shadow} group-hover:scale-110 transition-transform duration-300`}
                >
                  {item.icon}
                </div>

                {/* Title */}
                <h3 className="font-display font-bold text-slate-800 text-base sm:text-lg mb-2">
                  {item.title}
                </h3>

                {/* Desc */}
                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed mb-5">
                  {item.desc}
                </p>

                {/* Bottom stat */}
                <div
                  className={`flex items-center gap-2 pt-4 border-t border-slate-100`}
                >
                  <span
                    className={`font-display font-bold text-lg bg-gradient-to-r ${item.gradient} bg-clip-text text-transparent`}
                  >
                    {item.stat}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {item.statLabel}
                  </span>
                </div>

                {/* Decorative corner dot */}
                <div
                  className={`absolute top-4 right-4 w-2 h-2 rounded-full bg-gradient-to-br ${item.gradient} opacity-40 group-hover:opacity-80 transition-opacity`}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS — Infinite auto-scroll ── */}
      <section className="bg-sky-50/50 py-14 sm:py-20 overflow-hidden">
        <div className="text-center mb-8 sm:mb-12 px-4">
          <span className="inline-block bg-sky-100 text-sky-600 rounded-full px-4 py-1 text-xs font-bold uppercase tracking-wide mb-3">
            Testimonials
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
            What Travelers Say
          </h2>
          <p className="text-slate-500 text-sm">
            Real stories from real adventurers
          </p>
        </div>

        {/* Scroll container — no scrollbar, edge fade */}
        <div className="relative">
          {/* Left fade */}
          <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-r from-sky-50/80 to-transparent z-10 pointer-events-none" />
          {/* Right fade */}
          <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-l from-sky-50/80 to-transparent z-10 pointer-events-none" />

          {/* Moving track */}
          <div
            ref={trackRef}
            className="flex gap-4 will-change-transform"
            style={{ width: "max-content" }}
          >
            {INFINITE_TESTIMONIALS.map((t, idx) => (
              <div
                key={idx}
                className="w-72 sm:w-80 flex-shrink-0 bg-white rounded-2xl p-5 sm:p-6
                           border border-slate-100 shadow-md hover:shadow-lg
                           transition-shadow duration-300"
              >
                {/* Stars */}
                <div className="flex gap-0.5 mb-3">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star
                      key={i}
                      size={13}
                      className="text-amber-400 fill-amber-400"
                    />
                  ))}
                </div>
                {/* Quote */}
                <p className="text-slate-600 text-sm leading-relaxed mb-4 line-clamp-3">
                  "{t.text}"
                </p>
                {/* Author */}
                <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                  <div
                    className={`w-9 h-9 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800 text-sm">
                      {t.name}
                    </div>
                    <div className="text-xs text-slate-400">{t.loc}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA — Dark premium card ── */}
      <section className="py-12 sm:py-16 px-4 sm:px-5">
        <div
          className="max-w-2xl mx-auto relative overflow-hidden rounded-3xl"
          style={{
            background:
              "linear-gradient(135deg, #0c1e3c 0%, #0a2a4a 50%, #0d1f3c 100%)",
          }}
        >
          {/* Decorative blobs */}
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-sky-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-sky-400/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Star dots */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[
              ["15%", "20%"],
              ["75%", "15%"],
              ["85%", "60%"],
              ["20%", "75%"],
              ["55%", "85%"],
              ["40%", "30%"],
              ["65%", "45%"],
            ].map(([l, t], i) => (
              <div
                key={i}
                className="absolute w-0.5 h-0.5 bg-white/40 rounded-full"
                style={{ left: l, top: t }}
              />
            ))}
          </div>

          <div className="relative z-10 p-8 sm:p-12 text-center">
            {/* Animated emoji */}
            <div
              className="text-4xl sm:text-5xl mb-5 inline-block"
              style={{ animation: "float 3s ease-in-out infinite" }}
            >
              {isLoggedIn ? "✈️" : "🌍"}
            </div>

            {/* Heading */}
            <h2 className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-white mb-3">
              {isLoggedIn
                ? "Your Next Adventure Awaits!"
                : "Ready to Explore the World?"}
            </h2>

            {/* Subtext */}
            <p className="text-slate-400 mb-7 text-sm leading-relaxed max-w-sm mx-auto">
              {isLoggedIn
                ? "Browse our latest packages and book your next unforgettable trip."
                : `Join 50,000+ travelers who trust ${siteName} to plan their perfect getaway.`}
            </p>

            {/* CTA Button — responsive, one line */}
            <button
              onClick={handleCTA}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap
                         bg-gradient-to-r from-sky-400 to-sky-600
                         text-white font-semibold text-sm
                         px-6 sm:px-10 py-3 sm:py-3.5
                         rounded-full w-full sm:w-auto max-w-xs mx-auto
                         shadow-lg shadow-sky-500/30
                         hover:shadow-sky-400/50 hover:scale-105
                         transition-all duration-200"
            >
              {isLoggedIn
                ? "Explore All Packages →"
                : "Get Started — It's Free ✈️"}
            </button>

            {/* Trust row */}
            {!isLoggedIn && (
              <div className="flex items-center justify-center gap-3 mt-6 text-xs text-slate-500">
                <span>✅ Free to join</span>
                <span className="w-1 h-1 rounded-full bg-slate-600" />
                <span>🔒 No spam</span>
                <span className="w-1 h-1 rounded-full bg-slate-600" />
                <span>⭐ 4.9 rated</span>
              </div>
            )}
          </div>
        </div>

        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50%       { transform: translateY(-10px); }
          }
        `}</style>
      </section>
    </div>
  );
};

export default HomePage;
