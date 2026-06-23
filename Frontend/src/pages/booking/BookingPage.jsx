import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { usePackageById } from '../../hooks/usePackages';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { MapPin, Clock, Star, Users, CheckCircle, Calendar, AlertTriangle, Shield } from 'lucide-react';
import useAuthStore from '../../store/authStore';

const BookingPage = () => {
  const { id }           = useParams();
  const { pkg, loading } = usePackageById(id);
  const { user }         = useAuthStore();
  const navigate         = useNavigate();
  const [travelers, setTravelers] = useState(1);
  const stripPrefix = (p) => p?.replace(/^\+91/, '').replace(/\D/g, '').slice(0, 10) || '';

  const [form, setForm]  = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName:  user?.name?.split(' ').slice(1).join(' ') || '',
    email:     user?.email || '',
    phone:     stripPrefix(user?.phone),
    special:   '',
  });

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  if (loading) return <LoadingSpinner />;
  if (!pkg) return null;

  const base  = pkg.price * travelers;
  const tax   = Math.round(base * 0.05);
  const total = base + tax;

  // Cancellation deadline info
  const cancelDeadline = pkg.bookingDeadline ||
    (pkg.tourStartDate
      ? (() => { const d = new Date(pkg.tourStartDate); d.setDate(d.getDate()-7); return d.toISOString().split('T')[0]; })()
      : null);

  const imgSrc = pkg.imageUrl || pkg.image || null;

  const onSubmit = async (e) => {
    e.preventDefault();

    if (form.phone.length !== 10) {
      alert('Please enter a valid 10-digit phone number');
      return;
    }

    const bookingData = {
      packageId:       pkg.id,
      travelers,
      travelDate:      pkg.tourStartDate, // admin set tour date use karo
      specialRequests: form.special,
      firstName:       form.firstName,
      lastName:        form.lastName,
      phone:           `+91${form.phone}`,
    };

    sessionStorage.setItem('tn_booking', JSON.stringify({ pkg, form, travelers, total, base, tax }));
    sessionStorage.setItem('tn_booking_payload', JSON.stringify(bookingData));

    navigate('/payment');
  };

  return (
    <div>
      <div className="bg-gradient-to-br from-sky-50 to-white px-4 sm:px-5 pt-8 sm:pt-12 pb-6 text-center border-b border-sky-100">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-800 mb-1">Complete Your Booking</h1>
        <p className="text-slate-500 text-sm">Just a few details and your adventure begins!</p>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-5 py-6 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-8">

          {/* ── Form ── */}
          <form onSubmit={onSubmit} className="lg:col-span-2 glass-card p-5 sm:p-8">
            <h2 className="font-semibold text-slate-800 text-base sm:text-lg mb-5">Traveler Details</h2>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">First Name *</label>
                <input name="firstName" required placeholder="Aarav"
                  value={form.firstName} onChange={onChange} className="form-input text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Last Name *</label>
                <input name="lastName" required placeholder="Kumar"
                  value={form.lastName} onChange={onChange} className="form-input text-sm" />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Email *</label>
              <input name="email" type="email" required placeholder="you@example.com"
                value={form.email} onChange={onChange} className="form-input text-sm" />
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Phone *</label>
              <div className="flex">
                <span className="flex items-center px-3 border border-r-0 border-slate-200 rounded-l-xl bg-slate-50 text-slate-500 text-sm font-medium select-none">
                  +91
                </span>
                <input
                  name="phone"
                  type="tel"
                  inputMode="numeric"
                  required
                  maxLength={10}
                  placeholder="98765 43210"
                  value={form.phone}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setForm(f => ({ ...f, phone: digits }));
                  }}
                  className="form-input text-sm rounded-l-none flex-1" />
              </div>
              {form.phone && form.phone.length !== 10 && (
                <p className="text-xs text-red-500 mt-1">Phone number must be 10 digits</p>
              )}
            </div>

            {/* Number of travelers */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Number of Travelers *</label>
              <input type="number" min="1"
                max={pkg.availableSlots ?? pkg.slots ?? 20}
                value={travelers}
                onChange={e => setTravelers(Math.max(1, Number(e.target.value)))}
                className="form-input text-sm w-full sm:w-32" />
              <p className="text-xs text-slate-400 mt-1">
                {pkg.availableSlots ?? pkg.slots ?? 0} slots available
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Special Requests</label>
              <textarea name="special" rows={3}
                placeholder="Dietary needs, accessibility requirements..."
                value={form.special} onChange={onChange}
                className="form-input text-sm resize-none" />
            </div>

            {/* Cancellation policy reminder */}
            {cancelDeadline && (
              <div className="mb-5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700 flex items-start gap-2">
                <AlertTriangle size={13} className="flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Cancellation Policy: </span>
                  Cancel before <span className="font-bold">{new Date(cancelDeadline).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</span> for 100% refund.
                  After that — no refund.
                </div>
              </div>
            )}

            <button type="submit"
              disabled={form.phone.length !== 10}
              className="btn-primary w-full py-3 text-sm rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              <Shield size={14} /> Proceed to Payment →
            </button>
          </form>

          {/* ── Booking Summary ── */}
          <div className="glass-card p-5 h-fit lg:sticky lg:top-24">
            <h3 className="font-semibold text-slate-800 mb-4">Booking Summary</h3>

            {/* Package image */}
            <div className="rounded-xl overflow-hidden mb-4 relative h-28">
              {imgSrc ? (
                <img src={imgSrc} alt={pkg.title} className="w-full h-full object-cover"
                  onError={e => { e.target.style.display='none'; }} />
              ) : (
                <div className={`w-full h-full bg-gradient-to-br ${pkg.bg || 'from-sky-300 to-sky-500'}`} />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent flex items-end p-3">
                <div className="text-white">
                  <p className="font-display font-bold text-sm leading-snug line-clamp-1">{pkg.title}</p>
                  <p className="text-xs text-white/80 flex items-center gap-1 mt-0.5">
                    <MapPin size={10} /> {pkg.location}
                  </p>
                </div>
              </div>
            </div>

            {/* Tour schedule */}
            {pkg.tourStartDate && (
              <div className="bg-sky-50 rounded-xl p-3 mb-4 text-xs space-y-1.5">
                <p className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <Calendar size={12} className="text-sky-500" /> Tour Schedule
                </p>
                <div className="flex justify-between text-slate-600">
                  <span>Start Date</span>
                  <span className="font-medium">{new Date(pkg.tourStartDate).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</span>
                </div>
                {pkg.tourEndDate && (
                  <div className="flex justify-between text-slate-600">
                    <span>End Date</span>
                    <span className="font-medium">{new Date(pkg.tourEndDate).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</span>
                  </div>
                )}
                {cancelDeadline && (
                  <div className="flex justify-between text-amber-600 border-t border-sky-200 pt-1.5 mt-1">
                    <span className="font-medium">Cancel by</span>
                    <span className="font-bold">{new Date(cancelDeadline).toLocaleDateString('en-IN', { day:'numeric', month:'short' })}</span>
                  </div>
                )}
              </div>
            )}

            {/* Meta */}
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500 mb-4 pb-4 border-b border-sky-100">
              <span className="flex items-center gap-1"><Clock size={11} /> {pkg.duration}</span>
              <span className="flex items-center gap-1"><Star size={11} className="text-amber-400" /> {pkg.rating}</span>
              <span className="flex items-center gap-1"><Users size={11} /> {travelers} traveler{travelers > 1 ? 's' : ''}</span>
            </div>

            {/* Price breakdown */}
            <div className="space-y-2 text-xs text-slate-600 mb-4">
              <div className="flex justify-between">
                <span>₹{Number(pkg.price).toLocaleString('en-IN')} × {travelers} person(s)</span>
                <span>₹{base.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Taxes & Fees (5%)</span>
                <span>₹{tax.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-800 border-t border-sky-100 pt-2 text-sm">
                <span>Total</span>
                <span className="text-sky-600">₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="bg-green-50 border border-green-100 rounded-xl px-3 py-2 flex items-center gap-2 text-xs text-green-700">
              <CheckCircle size={12} className="text-green-500 flex-shrink-0" />
              Free cancellation 7+ days before tour
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default BookingPage;