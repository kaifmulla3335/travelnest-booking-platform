import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle, LayoutDashboard, Home, MapPin,
  Calendar, Users, Clock, Download, Share2, Plane, Loader2
} from 'lucide-react';
import useSiteStore from '../../store/siteStore';
import useAuthStore from '../../store/authStore';
import { downloadReceipt } from '../../services/bookingService';

const SuccessPage = () => {
  const navigate   = useNavigate();
  const { siteName } = useSiteStore();
  const { user }      = useAuthStore();
  const saved      = useRef(false);
  const bookingRef = sessionStorage.getItem('tn_booking_ref') || 'TN0001';
  const bookingId  = sessionStorage.getItem('tn_booking_id');
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState('');

  // A booking is always PENDING right at this point (admin hasn't reviewed it
  // yet) — so we download the Payment Receipt here, NOT the E-Ticket. The
  // E-Ticket (with QR) only becomes available after admin approval, from
  // the Dashboard.
  const handleDownloadReceipt = async () => {
    if (!bookingId) return;
    setDownloading(true);
    setDownloadError('');
    try {
      await downloadReceipt(bookingId, bookingRef);
    } catch (err) {
      setDownloadError('Could not download receipt. Please try again from My Bookings.');
    } finally {
      setDownloading(false);
    }
  };

  // Read booking data from session
  const raw = (() => {
    try { return JSON.parse(sessionStorage.getItem('tn_booking') || 'null'); }
    catch { return null; }
  })();

  const pkg  = raw?.pkg;
  const travelers = raw?.travelers || 1;
  const total     = raw?.total || 0;
  const tax       = raw?.tax   || 0;
  const base      = raw?.base  || 0;

  useEffect(() => {
    if (saved.current) return;
    saved.current = true;
    setTimeout(() => {
      sessionStorage.removeItem('tn_booking');
      sessionStorage.removeItem('tn_booking_payload');
      sessionStorage.removeItem('tn_booking_ref');
      sessionStorage.removeItem('tn_booking_id');
    }, 500);
  }, []);

  const bookedOn = new Date().toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-sky-50 to-white flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">

        {/* Success header */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl shadow-green-200">
            <CheckCircle size={38} className="text-white" />
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-800 mb-1">Booking Submitted!</h1>
          <p className="text-slate-500 text-sm">
            Your booking is <span className="text-amber-600 font-semibold">pending admin confirmation</span>.
            You'll be notified once confirmed.
          </p>
        </div>

        {/* ── TICKET CARD ── */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">

          {/* Ticket top — colored header */}
          <div className="bg-gradient-to-r from-sky-500 to-sky-700 p-5 text-white">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Plane size={20} className="rotate-45" />
                <span className="font-display font-bold text-lg">{siteName}</span>
              </div>
              <div className="text-right">
                <p className="text-sky-200 text-xs">Booking Reference</p>
                <p className="font-display font-bold text-xl tracking-wider">#{bookingRef}</p>
              </div>
            </div>
            {pkg && (
              <div>
                <h2 className="font-display text-xl font-bold leading-snug">{pkg.title}</h2>
                <p className="text-sky-200 text-xs flex items-center gap-1 mt-0.5">
                  <MapPin size={10} /> {pkg.location}
                </p>
              </div>
            )}
          </div>

          {/* Dashed separator */}
          <div className="flex items-center px-5 py-0">
            <div className="w-5 h-5 bg-sky-50 rounded-full border border-slate-100 -ml-8 flex-shrink-0" />
            <div className="flex-1 border-t-2 border-dashed border-slate-200 mx-2" />
            <div className="w-5 h-5 bg-sky-50 rounded-full border border-slate-100 -mr-8 flex-shrink-0" />
          </div>

          {/* Ticket body */}
          <div className="px-5 py-4">

            {/* Tour dates */}
            {pkg?.tourStartDate && (
              <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-dashed border-slate-200">
                <div>
                  <p className="text-xs text-slate-400 uppercase font-semibold tracking-wide mb-1">Tour Start</p>
                  <p className="font-semibold text-slate-800 text-sm">
                    {new Date(pkg.tourStartDate).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })}
                  </p>
                </div>
                {pkg.tourEndDate && (
                  <div>
                    <p className="text-xs text-slate-400 uppercase font-semibold tracking-wide mb-1">Tour End</p>
                    <p className="font-semibold text-slate-800 text-sm">
                      {new Date(pkg.tourEndDate).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Details grid */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 mb-4 pb-4 border-b border-dashed border-slate-200 text-sm">
              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold tracking-wide mb-0.5 flex items-center gap-1">
                  <Users size={10} /> Travelers
                </p>
                <p className="font-semibold text-slate-800">{travelers} person{travelers > 1 ? 's' : ''}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold tracking-wide mb-0.5 flex items-center gap-1">
                  <Clock size={10} /> Duration
                </p>
                <p className="font-semibold text-slate-800">{pkg?.duration || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold tracking-wide mb-0.5 flex items-center gap-1">
                  <Calendar size={10} /> Booked On
                </p>
                <p className="font-semibold text-slate-800">{bookedOn}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold tracking-wide mb-0.5">Category</p>
                <p className="font-semibold text-slate-800">{pkg?.category || '—'}</p>
              </div>
            </div>

            {/* Passenger name — from your account, same as the PDF receipt/ticket */}
            {user?.name && (
              <div className="mb-4 pb-4 border-b border-dashed border-slate-200">
                <p className="text-xs text-slate-400 uppercase font-semibold tracking-wide mb-0.5">Passenger</p>
                <p className="font-semibold text-slate-800">{user.name}</p>
                <p className="text-xs text-slate-400">{user.email}</p>
              </div>
            )}

            {/* Price breakdown */}
            <div className="space-y-1.5 text-sm mb-4">
              <div className="flex justify-between text-slate-600">
                <span>Base Amount</span>
                <span>₹{base.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Taxes (5%)</span>
                <span>₹{tax.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-800 border-t border-slate-200 pt-2 text-base">
                <span>Total Paid</span>
                <span className="text-sky-600">₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Status */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 flex items-center justify-between text-xs">
              <span className="text-amber-700 font-medium">Booking Status</span>
              <span className="bg-amber-100 text-amber-700 font-bold px-3 py-1 rounded-full">
                ⏳ Pending Confirmation
              </span>
            </div>
          </div>

          {/* Dashed separator bottom */}
          <div className="flex items-center px-5 py-0">
            <div className="w-5 h-5 bg-sky-50 rounded-full border border-slate-100 -ml-8 flex-shrink-0" />
            <div className="flex-1 border-t-2 border-dashed border-slate-200 mx-2" />
            <div className="w-5 h-5 bg-sky-50 rounded-full border border-slate-100 -mr-8 flex-shrink-0" />
          </div>

          {/* Ticket footer */}
          <div className="px-5 py-4 bg-slate-50">
            <p className="text-xs text-slate-500 text-center mb-3">
              📧 Confirmation will be sent to <span className="font-semibold">{user?.email || 'your email'}</span>
            </p>
            <p className="text-xs text-slate-400 text-center">
              Cancellation: Free if cancelled 7+ days before tour start date.
            </p>
          </div>
        </div>

        {/* Download ticket error */}
        {downloadError && (
          <p className="text-red-500 text-xs text-center mt-3">{downloadError}</p>
        )}

        {/* Download Receipt button */}
        <button
          onClick={handleDownloadReceipt}
          disabled={downloading || !bookingId}
          className="w-full mt-5 bg-slate-800 hover:bg-slate-900 text-white py-3 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 disabled:opacity-60 transition-colors"
        >
          {downloading ? (
            <><Loader2 size={15} className="animate-spin" /> Generating PDF...</>
          ) : (
            <><Download size={15} /> Download Payment Receipt (PDF)</>
          )}
        </button>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3 mt-3">
          <button onClick={() => navigate('/dashboard')}
            className="btn-primary py-3 text-sm rounded-xl flex items-center justify-center gap-2">
            <LayoutDashboard size={15} /> My Bookings
          </button>
          <button onClick={() => navigate('/')}
            className="btn-outline py-3 text-sm rounded-xl flex items-center justify-center gap-2">
            <Home size={15} /> Go Home
          </button>
        </div>

      </div>
    </div>
  );
};

export default SuccessPage;