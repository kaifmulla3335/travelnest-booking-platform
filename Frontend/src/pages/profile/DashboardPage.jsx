import { useState, useEffect, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import StatusBadge from '../../components/common/StatusBadge';
import {
  Plane, Clock, CheckCircle, DollarSign, Plus,
  MapPin, Loader2, X, AlertTriangle, Calendar, Download, Info
} from 'lucide-react';
import axiosInstance from '../../api/axios';
import { downloadReceipt, downloadTicket } from '../../services/bookingService';

// ── NEW cancellation policy: 7+ days = 100% refund, within 7 = No refund ──
const getCancellationPolicy = (travelDate) => {
  if (!travelDate) return null;
  const today    = new Date();
  const travel   = new Date(travelDate);
  const daysLeft = Math.ceil((travel - today) / (1000 * 60 * 60 * 24));

  if (daysLeft >= 7) return {
    refund: 100,
    label:  '100% Full Refund',
    color:  'text-green-600',
    bg:     'bg-green-50 border-green-200',
    daysLeft,
  };
  return {
    refund: 0,
    label:  'No Refund',
    color:  'text-red-600',
    bg:     'bg-red-50 border-red-200',
    daysLeft,
  };
};

// A booking is "final" once it's cancelled either way — nothing more can happen to it
const isFinalCancelled = (status) => status === 'CANCELLED_BY_USER' || status === 'CANCELLED_BY_ADMIN';

const DashboardPage = () => {
  const { user }      = useAuthStore();
  const navigate      = useNavigate();
  const [bookings,    setBookings]   = useState([]);
  const [loading,     setLoading]    = useState(true);
  const [cancelId,    setCancelId]   = useState(null);
  const [cancelling,  setCancelling] = useState(false);
  const [successMsg,  setSuccessMsg] = useState('');
  const [errorMsg,    setErrorMsg]   = useState('');
  const [downloadingId, setDownloadingId] = useState(null);

  // ── Download — CONFIRMED gets the final E-Ticket (with QR); everything else
  //     (PENDING, CANCEL_REQUESTED) gets the Payment Receipt instead. Cancelled
  //     bookings get no download — there's nothing to travel with. ──
  const handleDownload = async (booking) => {
    setDownloadingId(booking.id);
    try {
      if (booking.status === 'CONFIRMED') {
        await downloadTicket(booking.id, booking.bookingRef);
      } else {
        await downloadReceipt(booking.id, booking.bookingRef);
      }
    } catch (err) {
      setErrorMsg('Could not download. Please try again.');
      setTimeout(() => setErrorMsg(''), 4000);
    } finally {
      setDownloadingId(null);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = () => {
    setLoading(true);
    axiosInstance.get('/bookings/my')
      .then(res => setBookings(Array.isArray(res.data) ? res.data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleCancelRequest = async () => {
    if (!cancelId) return;
    setCancelling(true);
    setErrorMsg('');
    try {
      await axiosInstance.put(`/bookings/${cancelId}/cancel`);
      setBookings(prev => prev.map(b =>
        b.id === cancelId ? { ...b, status: 'CANCEL_REQUESTED' } : b
      ));
      setCancelId(null);
      setSuccessMsg('Cancellation request submitted. Admin will process within 24 hours.');
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit cancellation. Please try again.');
      console.error(err);
    } finally {
      setCancelling(false);
    }
  };

  const confirmed  = bookings.filter(b => b.status === 'CONFIRMED').length;
  const pending    = bookings.filter(b => b.status === 'PENDING').length;
  const totalSpent = bookings
    .filter(b => b.status === 'CONFIRMED')
    .reduce((s, b) => s + (b.totalAmount || 0), 0);

  // Booking being cancelled
  const cancelBooking = bookings.find(b => b.id === cancelId);
  const cancelTourDate = cancelBooking?.tourStartDate || cancelBooking?.travelDate;
  const policy         = cancelTourDate ? getCancellationPolicy(cancelTourDate) : null;

  const metrics = [
    { icon: <Plane size={19} className="text-sky-500" />,         val: bookings.length,                          label: 'Total Bookings' },
    { icon: <Clock size={19} className="text-amber-500" />,       val: pending,                                  label: 'Pending'        },
    { icon: <CheckCircle size={19} className="text-green-500" />, val: confirmed,                                label: 'Confirmed'      },
    { icon: <DollarSign size={19} className="text-sky-600" />,    val: `₹${totalSpent.toLocaleString('en-IN')}`, label: 'Total Spent'    },
  ];

  // ── Shared "action cell" content for both desktop + mobile ──
  const renderActions = (b, size) => (
    <div className="flex items-center gap-2 flex-wrap">
      {!isFinalCancelled(b.status) && (
        <button onClick={() => handleDownload(b)}
          disabled={downloadingId === b.id}
          title={b.status === 'CONFIRMED' ? 'Download E-Ticket' : 'Download Payment Receipt'}
          className="text-xs text-sky-500 hover:text-sky-700 font-medium hover:underline transition-colors flex items-center gap-1 disabled:opacity-50">
          {downloadingId === b.id
            ? <Loader2 size={size} className="animate-spin" />
            : <Download size={size} />}
          {b.status === 'CONFIRMED' ? 'Ticket' : 'Receipt'}
        </button>
      )}
      {(b.status === 'CONFIRMED' || b.status === 'PENDING') && (
        <button onClick={() => setCancelId(b.id)}
          className="text-xs text-red-500 hover:text-red-700 font-medium hover:underline transition-colors">
          Cancel
        </button>
      )}
      {b.status === 'CANCEL_REQUESTED' && (
        <span className="text-xs text-orange-500 font-medium">Processing...</span>
      )}
      {isFinalCancelled(b.status) && b.refundStatus && (
        <StatusBadge status={b.refundStatus} />
      )}
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-5 py-8 sm:py-10">

      {/* Greeting */}
      <div className="mb-6">
        <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-800">
          Good morning, {user?.name?.split(' ')[0]} ☀️
        </h1>
        <p className="text-slate-400 text-sm mt-1">Ready for your next adventure?</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {metrics.map(m => (
          <div key={m.label} className="glass-card p-4 sm:p-5">
            <div className="mb-2.5">{m.icon}</div>
            <div className="font-display text-xl sm:text-2xl font-bold text-sky-600 truncate">{m.val}</div>
            <div className="text-xs text-slate-400 mt-0.5">{m.label}</div>
          </div>
        ))}
      </div>

      {/* Success message */}
      {successMsg && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
          <CheckCircle size={15} /> {successMsg}
        </div>
      )}

      {/* Global error message (e.g. ticket download failures) */}
      {errorMsg && !cancelId && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
          <AlertTriangle size={15} /> {errorMsg}
        </div>
      )}

      {/* Pending notice */}
      {pending > 0 && (
        <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-2.5 text-sm text-amber-700">
          <Clock size={16} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">{pending} booking{pending > 1 ? 's' : ''} awaiting confirmation</p>
            <p className="text-xs text-amber-600 mt-0.5">
              Download your payment receipt now — the final E-Ticket with QR code unlocks once admin confirms.
            </p>
          </div>
        </div>
      )}

      {/* Bookings table */}
      <div className="glass-card overflow-hidden">
        <div className="px-4 sm:px-5 py-4 border-b border-sky-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800 text-sm sm:text-base">My Bookings</h2>
          <button onClick={() => navigate('/packages')}
            className="btn-primary text-xs px-3 sm:px-4 py-2 flex items-center gap-1.5">
            <Plus size={13} /> New Booking
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12 gap-2 text-slate-400">
            <Loader2 size={18} className="animate-spin" /> Loading your bookings...
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-12 px-5">
            <div className="w-14 h-14 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Plane size={24} className="text-sky-400" />
            </div>
            <p className="text-slate-500 text-sm font-medium mb-1">No bookings yet</p>
            <p className="text-slate-400 text-xs mb-4">Book a package to see your trips here</p>
            <button onClick={() => navigate('/packages')} className="btn-primary text-xs px-4 py-2">
              Explore Packages
            </button>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sky-50">
                  <tr>{['Booking ID','Package','Booked On','Tour Date','Amount','Payment','Status','Action'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-sky-600 text-xs uppercase font-semibold tracking-wide">{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {bookings.map(b => (
                    <Fragment key={b.id}>
                      <tr className="border-b border-sky-50 hover:bg-sky-50/30 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-sky-600 font-semibold">#{b.bookingRef}</td>
                        <td className="px-4 py-3 font-medium text-slate-800 text-sm max-w-[140px] truncate">{b.packageTitle}</td>
                        <td className="px-4 py-3 text-slate-400 text-xs">{b.createdAt?.slice(0,10)}</td>
                        <td className="px-4 py-3 text-slate-600 text-xs font-medium">{b.travelDate}</td>
                        <td className="px-4 py-3 font-semibold text-slate-800 text-sm">
                          ₹{Number(b.totalAmount).toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full
                            ${b.paymentStatus === 'PAID'     ? 'bg-green-100 text-green-700' :
                              b.paymentStatus === 'REFUNDED' ? 'bg-red-100 text-red-600'    :
                              'bg-amber-100 text-amber-700'}`}>
                            {b.paymentStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                        <td className="px-4 py-3">{renderActions(b, 12)}</td>
                      </tr>
                      {b.adminNote && isFinalCancelled(b.status) && (
                        <tr className="border-b border-sky-50">
                          <td colSpan={8} className="px-4 pb-3 -mt-2">
                            <p className="text-xs text-slate-400 flex items-start gap-1.5">
                              <Info size={11} className="flex-shrink-0 mt-0.5" />
                              {b.adminNote}
                            </p>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden divide-y divide-sky-50">
              {bookings.map(b => (
                <div key={b.id} className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{b.packageTitle}</p>
                      <p className="font-mono text-xs text-sky-500 mt-0.5">#{b.bookingRef}</p>
                    </div>
                    <StatusBadge status={b.status} />
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-400 mb-2">
                    <span className="flex items-center gap-1"><Calendar size={10} /> Booked: {b.createdAt?.slice(0,10)}</span>
                    <span className="flex items-center gap-1"><MapPin size={10} /> Tour: {b.travelDate}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-sky-600">₹{Number(b.totalAmount).toLocaleString('en-IN')}</span>
                    {renderActions(b, 11)}
                  </div>
                  {b.status === 'PENDING' && (
                    <div className="mt-2 bg-amber-50 border border-amber-100 rounded-lg px-3 py-1.5 text-xs text-amber-700 flex items-center gap-1.5">
                      <Clock size={11} /> Awaiting admin confirmation
                    </div>
                  )}
                  {b.adminNote && isFinalCancelled(b.status) && (
                    <p className="mt-2 text-xs text-slate-400 flex items-start gap-1.5">
                      <Info size={11} className="flex-shrink-0 mt-0.5" /> {b.adminNote}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Cancel Confirmation Modal ── */}
      {cancelId && cancelBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !cancelling && setCancelId(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">

            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-lg font-bold text-slate-800">Cancel Booking</h3>
              <button onClick={() => setCancelId(null)} className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400">
                <X size={16} />
              </button>
            </div>

            {/* Booking info */}
            <div className="bg-slate-50 rounded-xl p-4 mb-4 text-sm">
              <p className="font-semibold text-slate-800">{cancelBooking.packageTitle}</p>
              <p className="text-slate-400 text-xs mt-1 flex items-center gap-1">
                <Calendar size={11} /> Tour Date: {cancelTourDate || cancelBooking.travelDate}
              </p>
              <p className="font-bold text-slate-800 mt-1.5">
                ₹{Number(cancelBooking.totalAmount).toLocaleString('en-IN')}
              </p>
            </div>

            {/* Refund info — NEW SIMPLE POLICY */}
            {policy && (
              <div className={`border rounded-xl p-4 mb-4 ${policy.bg}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-700">Refund Eligibility</span>
                  <span className={`text-sm font-bold ${policy.color}`}>{policy.label}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Refund Amount</span>
                  <span className={`font-bold text-base ${policy.color}`}>
                    {policy.refund === 100
                      ? `₹${Number(cancelBooking.totalAmount).toLocaleString('en-IN')}`
                      : '₹0'}
                  </span>
                </div>
                <p className={`text-xs mt-2 ${policy.color}`}>
                  {policy.refund === 100
                    ? `✅ ${policy.daysLeft} days left — you qualify for full refund`
                    : `❌ Less than 7 days to tour — no refund applicable`}
                </p>
              </div>
            )}

            {/* Simple policy table */}
            <div className="mb-5">
              <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Cancellation Policy</p>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">7+ days before tour</span>
                  <span className="font-bold text-green-600">100% Full Refund ✅</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">Within 7 days of tour</span>
                  <span className="font-bold text-red-500">No Refund ❌</span>
                </div>
              </div>
            </div>

            {/* Error message */}
            {errorMsg && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl px-3 py-2.5">
                ⚠️ {errorMsg}
              </div>
            )}

            <div className="bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5 text-xs text-amber-700 flex items-start gap-2 mb-5">
              <AlertTriangle size={13} className="flex-shrink-0 mt-0.5" />
              Cancellation request will be sent to admin. Refund processed within 5–7 business days.
            </div>

            <div className="flex gap-3">
              <button onClick={() => { setCancelId(null); setErrorMsg(''); }} disabled={cancelling}
                className="flex-1 border border-slate-200 text-slate-600 rounded-xl py-2.5 text-sm font-medium hover:bg-slate-50 transition-colors">
                Keep Booking
              </button>
              <button onClick={handleCancelRequest} disabled={cancelling}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl py-2.5 text-sm font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                {cancelling
                  ? <><Loader2 size={14} className="animate-spin" /> Submitting...</>
                  : 'Request Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;