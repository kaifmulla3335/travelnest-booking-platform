import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePackageById } from '../../hooks/usePackages';
import { ArrowLeft, MapPin, Clock, Star, Users, Check, Shield, Phone, Calendar, AlertTriangle, CheckCircle } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import useAuthStore from '../../store/authStore';

const getImage  = (pkg) => pkg?.imageUrl || pkg?.image || null;
const getBg     = (pkg) => pkg?.bg || 'from-sky-300 to-sky-500';
const getEmoji  = (pkg) => pkg?.emoji || '✈️';
const getSlots  = (pkg) => pkg?.availableSlots ?? pkg?.slots ?? 0;

// Cancellation policy based on travel date
const getCancelInfo = (tourStartDate) => {
  if (!tourStartDate) return null;
  const today    = new Date();
  const tourDate = new Date(tourStartDate);
  const daysLeft = Math.ceil((tourDate - today) / (1000 * 60 * 60 * 24));
  const deadline = new Date(tourDate);
  deadline.setDate(deadline.getDate() - 7);
  const deadlineStr = deadline.toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });

  if (daysLeft >= 7) {
    return {
      canRefund: true,
      deadlineStr,
      daysLeft,
      msg: `Cancel before ${deadlineStr} for 100% refund`,
      color: 'text-green-700', bg: 'bg-green-50 border-green-200',
    };
  }
  return {
    canRefund: false,
    deadlineStr,
    daysLeft,
    msg: 'Cancellation deadline passed — no refund available',
    color: 'text-red-600', bg: 'bg-red-50 border-red-200',
  };
};

// Check if booking is allowed (tour must be 7+ days away)
const isBookingAllowed = (tourStartDate) => {
  if (!tourStartDate) return true; // legacy packages without date
  const daysLeft = Math.ceil((new Date(tourStartDate) - new Date()) / (1000*60*60*24));
  return daysLeft >= 7;
};

const PackageDetail = () => {
  const { id }           = useParams();
  const { pkg, loading } = usePackageById(id);
  const navigate         = useNavigate();
  const { isLoggedIn }   = useAuthStore();
  const [imgError, setImgError] = useState(false);

  if (loading) return <LoadingSpinner text="Loading package..." />;
  if (!pkg) return (
    <div className="text-center py-20 px-5">
      <div className="text-5xl mb-4">😕</div>
      <p className="text-slate-500 mb-4">Package not found.</p>
      <button onClick={() => navigate('/packages')} className="btn-primary px-6 py-2 text-sm">Browse Packages</button>
    </div>
  );

  const tax          = Math.round(Number(pkg.price) * 0.05);
  const total        = Number(pkg.price) + tax;
  const image        = getImage(pkg);
  const cancelInfo   = getCancelInfo(pkg.tourStartDate);
  const bookingOk    = isBookingAllowed(pkg.tourStartDate);
  const deadline     = pkg.bookingDeadline || (pkg.tourStartDate
    ? (() => { const d = new Date(pkg.tourStartDate); d.setDate(d.getDate()-7); return d.toISOString().split('T')[0]; })()
    : null);

  const handleBook = () => {
    if (!isLoggedIn) { navigate('/login'); return; }
    if (!bookingOk)  return;
    navigate(`/booking/${pkg.id}`);
  };

  return (
    <div>
      {/* Hero */}
      <div className="relative h-52 sm:h-64 md:h-80 overflow-hidden">
        {!imgError && image ? (
          <img src={image} alt={pkg.title} onError={() => setImgError(true)} className="w-full h-full object-cover" />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${getBg(pkg)} flex items-center justify-center`}>
            <span className="text-7xl opacity-80">{getEmoji(pkg)}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-8 pb-4 sm:pb-6 text-white">
          <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-2.5 py-1 text-xs mb-2">
            <MapPin size={10} /> {pkg.location} · {pkg.duration}
          </div>
          <h1 className="font-display text-xl sm:text-3xl font-bold leading-tight">{pkg.title}</h1>
          <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs sm:text-sm opacity-90">
            <span className="flex items-center gap-1"><Star size={12} className="text-amber-400 fill-amber-400" /> {pkg.rating}</span>
            <span className="flex items-center gap-1"><Users size={12} /> {getSlots(pkg)} slots left</span>
            <span className="bg-white/20 border border-white/30 rounded-full px-2.5 py-0.5 text-xs">{pkg.category}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-5 py-5 sm:py-8">
        <button onClick={() => navigate('/packages')}
          className="flex items-center gap-1.5 text-sky-500 text-sm font-medium mb-5 hover:text-sky-700 transition-colors">
          <ArrowLeft size={15} /> Back to Packages
        </button>

        <div className="flex flex-col lg:flex-row gap-5 sm:gap-8">

          {/* Left — Details */}
          <div className="lg:flex-1 order-2 lg:order-1">
            <h2 className="font-display text-lg sm:text-xl font-bold text-slate-800 mb-2.5">About this Package</h2>
            <p className="text-slate-600 leading-relaxed text-sm mb-5">{pkg.description}</p>

            {/* Info grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 glass-card p-4 sm:p-5 mb-5">
              {[
                { label:'Duration',   val: pkg.duration },
                { label:'Category',   val: pkg.category },
                { label:'Slots Left', val: `${getSlots(pkg)} seats`, red: true },
                { label:'Rating',     val: `⭐ ${pkg.rating}/5` },
              ].map(i => (
                <div key={i.label}>
                  <div className="text-[10px] sm:text-xs text-slate-400 uppercase font-semibold tracking-wide mb-1">{i.label}</div>
                  <div className={`font-semibold text-xs sm:text-sm ${i.red ? 'text-red-500' : 'text-slate-800'}`}>{i.val}</div>
                </div>
              ))}
            </div>

            {/* Tour Dates */}
            {(pkg.tourStartDate || pkg.tourEndDate) && (
              <div className="glass-card p-4 sm:p-5 mb-5">
                <h3 className="font-semibold text-slate-800 mb-3 text-sm flex items-center gap-2">
                  <Calendar size={15} className="text-sky-500" /> Tour Schedule
                </h3>
                <div className="flex flex-wrap gap-4 text-sm">
                  {pkg.tourStartDate && (
                    <div>
                      <p className="text-xs text-slate-400 mb-0.5">Start Date</p>
                      <p className="font-semibold text-slate-800">
                        {new Date(pkg.tourStartDate).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })}
                      </p>
                    </div>
                  )}
                  {pkg.tourEndDate && (
                    <div>
                      <p className="text-xs text-slate-400 mb-0.5">End Date</p>
                      <p className="font-semibold text-slate-800">
                        {new Date(pkg.tourEndDate).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })}
                      </p>
                    </div>
                  )}
                  {deadline && (
                    <div>
                      <p className="text-xs text-slate-400 mb-0.5">Booking Deadline</p>
                      <p className="font-semibold text-amber-600">{deadline}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Cancellation Policy */}
            <div className="glass-card p-4 sm:p-5 mb-5">
              <h3 className="font-semibold text-slate-800 mb-3 text-sm">Cancellation Policy</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2.5 text-sm">
                  <CheckCircle size={15} className="text-green-500 flex-shrink-0" />
                  <span className="text-slate-700">
                    <span className="font-semibold">7+ days before tour</span> → <span className="text-green-600 font-semibold">100% Full Refund</span>
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-sm">
                  <AlertTriangle size={15} className="text-red-500 flex-shrink-0" />
                  <span className="text-slate-700">
                    <span className="font-semibold">Within 7 days</span> → <span className="text-red-500 font-semibold">No Refund</span>
                  </span>
                </div>
              </div>

              {/* Live status for this package */}
              {cancelInfo && (
                <div className={`mt-3 border rounded-xl px-3 py-2.5 text-xs font-medium flex items-center gap-2 ${cancelInfo.bg} ${cancelInfo.color}`}>
                  {cancelInfo.canRefund
                    ? <CheckCircle size={13} className="flex-shrink-0" />
                    : <AlertTriangle size={13} className="flex-shrink-0" />}
                  {cancelInfo.msg}
                </div>
              )}
            </div>

            {/* Highlights */}
            {pkg.highlights && pkg.highlights.length > 0 && (
              <>
                <h3 className="font-semibold text-slate-800 mb-3 text-sm sm:text-base">What's Included</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  {pkg.highlights.map(h => (
                    <div key={h} className="flex items-center gap-2 text-slate-600 text-sm">
                      <Check size={13} className="text-sky-500 flex-shrink-0" /> {h}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Right — Booking Card */}
          <div className="lg:w-80 order-1 lg:order-2">
            <div className="glass-card p-4 sm:p-6 lg:sticky lg:top-24">
              <div className="flex items-baseline gap-1 mb-1">
                <span className="font-display text-2xl sm:text-3xl font-bold text-sky-600">
                  ₹{Number(pkg.price).toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-slate-400">/person</span>
              </div>
              <p className="text-xs text-slate-400 mb-4">All-inclusive package</p>

              {/* Booking disabled warning */}
              {!bookingOk && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 mb-4 text-xs text-red-600 flex items-center gap-2">
                  <AlertTriangle size={13} className="flex-shrink-0" />
                  Booking closed — Tour starts in less than 7 days
                </div>
              )}

              {/* Trust items */}
              <div className="space-y-1.5 text-xs sm:text-sm text-slate-600 mb-4">
                <div className="flex items-center gap-2"><Check size={12} className="text-green-500" /> Free cancellation 7+ days before</div>
                <div className="flex items-center gap-2"><Shield size={12} className="text-sky-500" /> Secure payment via Razorpay</div>
                <div className="flex items-center gap-2"><Phone size={12} className="text-sky-500" /> 24/7 travel support</div>
              </div>

              {/* Price breakdown */}
              <div className="bg-sky-50 rounded-xl p-3 sm:p-4 mb-4 text-xs text-slate-600 space-y-1.5">
                <div className="flex justify-between"><span>Base price</span><span>₹{Number(pkg.price).toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between"><span>Taxes (5%)</span><span>₹{tax.toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between font-bold text-slate-800 border-t border-sky-200 pt-1.5">
                  <span>Total</span><span className="text-sky-600">₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button onClick={handleBook}
                disabled={!bookingOk}
                className="btn-primary w-full py-3 text-sm rounded-xl mb-2.5 disabled:opacity-50 disabled:cursor-not-allowed">
                {!bookingOk ? 'Booking Closed' : isLoggedIn ? 'Book This Package →' : 'Login to Book →'}
              </button>
              <button className="btn-outline w-full py-2.5 text-sm rounded-xl">❤️ Add to Wishlist</button>

              {/* Cancellation reminder in card */}
              {cancelInfo && bookingOk && (
                <div className={`mt-3 border rounded-xl px-3 py-2 text-xs ${cancelInfo.bg} ${cancelInfo.color} flex items-center gap-1.5`}>
                  {cancelInfo.canRefund
                    ? <><CheckCircle size={11} /> Cancel by {cancelInfo.deadlineStr} for full refund</>
                    : <><AlertTriangle size={11} /> No refund — within 7 days of tour</>}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageDetail;