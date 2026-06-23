import { useState, useEffect } from 'react';
import {
  Search, Eye, Loader2, X, Check, Ban, AlertTriangle, Info, Download, ShieldAlert
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import {
  approveBooking, rejectBooking, forceCancelBooking, decideCancelRequest,
  downloadReceiptAdmin, downloadTicketAdmin,
} from '../../services/bookingService';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
const getToken = () => localStorage.getItem('tn_token');

// Simple policy: 7+ days = full refund, within 7 = no refund (used for cancel-request preview only —
// the actual amount that gets refunded is always calculated server-side)
const getRefundInfo = (travelDate, amount) => {
  if (!travelDate || !amount) return null;
  const daysLeft = Math.ceil((new Date(travelDate) - new Date()) / (1000*60*60*24));
  if (daysLeft >= 7) return { refund: 100, amount: Math.round(amount), label: '100% Full Refund', color: 'text-green-600', bg: 'bg-green-50 border-green-200', daysLeft };
  return { refund: 0, amount: 0, label: 'No Refund', color: 'text-red-600', bg: 'bg-red-50 border-red-200', daysLeft };
};

const isFinalCancelled = (status) => status === 'CANCELLED_BY_USER' || status === 'CANCELLED_BY_ADMIN';

const AdminBookings = () => {
  const [bookings,  setBookings]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [filter,    setFilter]    = useState('All');
  const [detail,    setDetail]    = useState(null);
  const [updating,  setUpdating]  = useState(null);
  const [toast,     setToast]     = useState('');
  const [downloadingId, setDownloadingId] = useState(null);

  // Reason modal — used for both "Reject booking" and "Force-cancel booking"
  const [reasonModal, setReasonModal] = useState(null); // { type: 'reject' | 'forceCancel', booking }
  const [reasonText,  setReasonText]  = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  const updateLocalBooking = (updated) => {
    setBookings(prev => prev.map(b => b.id === updated.id ? updated : b));
    if (detail?.id === updated.id) setDetail(updated);
  };

  // ── Downloads ──
  const handleDownloadReceipt = async (booking) => {
    setDownloadingId(booking.id + '-receipt');
    try {
      await downloadReceiptAdmin(booking.id, booking.bookingRef);
    } catch {
      showToast('❌ Could not download receipt');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDownloadTicket = async (booking) => {
    setDownloadingId(booking.id + '-ticket');
    try {
      await downloadTicketAdmin(booking.id, booking.bookingRef);
    } catch {
      showToast('❌ Could not download ticket');
    } finally {
      setDownloadingId(null);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/admin/bookings`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      setBookings(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  // ── State-machine actions ──
  const handleApprove = async (id) => {
    setUpdating(id + 'approve');
    try {
      const res = await approveBooking(id);
      updateLocalBooking(res.data);
      showToast('✅ Booking confirmed! E-Ticket with QR code is now available.');
    } catch (err) {
      showToast('❌ ' + (err.response?.data?.message || 'Failed to approve'));
    } finally {
      setUpdating(null);
    }
  };

  const handleReasonSubmit = async () => {
    if (!reasonModal) return;
    const { type, booking } = reasonModal;
    setUpdating(booking.id + type);
    try {
      const res = type === 'reject'
        ? await rejectBooking(booking.id, reasonText)
        : await forceCancelBooking(booking.id, reasonText);
      updateLocalBooking(res.data);
      showToast(type === 'reject'
        ? '🚫 Booking rejected — full refund initiated'
        : '🚫 Booking cancelled — full refund initiated');
      setReasonModal(null);
      setReasonText('');
    } catch (err) {
      showToast('❌ ' + (err.response?.data?.message || 'Action failed'));
    } finally {
      setUpdating(null);
    }
  };

  const handleCancelDecision = async (id, approve) => {
    setUpdating(id + 'cancelDecision');
    try {
      const res = await decideCancelRequest(id, approve);
      updateLocalBooking(res.data);
      showToast(approve
        ? '🚫 Cancellation approved — refund initiated per policy'
        : '✅ Cancellation rejected — booking restored');
    } catch (err) {
      showToast('❌ ' + (err.response?.data?.message || 'Action failed'));
    } finally {
      setUpdating(null);
    }
  };

  const STATUS_FILTERS = ['All', 'PENDING', 'CONFIRMED', 'CANCEL_REQUESTED', 'CANCELLED_BY_USER', 'CANCELLED_BY_ADMIN'];

  const filtered = bookings.filter(b => {
    const matchFilter = filter === 'All' || b.status === filter;
    const matchSearch = !search ||
      b.bookingRef?.toLowerCase().includes(search.toLowerCase()) ||
      b.packageTitle?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const revenue        = bookings.filter(b => b.status === 'CONFIRMED').reduce((s, b) => s + (b.totalAmount || 0), 0);
  const cancelRequests = bookings.filter(b => b.status === 'CANCEL_REQUESTED').length;

  if (loading) return (
    <div className="flex items-center justify-center py-20 gap-3 text-slate-400">
      <Loader2 size={20} className="animate-spin" /> Loading bookings...
    </div>
  );

  // ── Shared action buttons for both table row + detail modal ──
  const renderRowActions = (b, size = 14) => (
    <div className="flex items-center gap-1">
      {/* View detail */}
      <button onClick={() => setDetail(b)}
        title="View details"
        className="group relative p-1.5 rounded-lg hover:bg-sky-50 text-slate-400 hover:text-sky-500 transition-colors">
        <Eye size={size} />
      </button>

      {/* Receipt — always available */}
      <button onClick={() => handleDownloadReceipt(b)}
        disabled={downloadingId === b.id + '-receipt'}
        title="Download Payment Receipt"
        className="group relative p-1.5 rounded-lg hover:bg-sky-50 text-slate-400 hover:text-sky-500 transition-colors disabled:opacity-40">
        {downloadingId === b.id + '-receipt' ? <Loader2 size={size} className="animate-spin" /> : <Download size={size} />}
      </button>

      {/* Ticket — CONFIRMED only */}
      {b.status === 'CONFIRMED' && (
        <button onClick={() => handleDownloadTicket(b)}
          disabled={downloadingId === b.id + '-ticket'}
          title="Download E-Ticket (with QR)"
          className="group relative p-1.5 rounded-lg hover:bg-green-50 text-slate-400 hover:text-green-600 transition-colors disabled:opacity-40">
          {downloadingId === b.id + '-ticket' ? <Loader2 size={size} className="animate-spin" /> : <ShieldAlert size={size} />}
        </button>
      )}

      {/* PENDING → Approve / Reject */}
      {b.status === 'PENDING' && (
        <>
          <button onClick={() => handleApprove(b.id)}
            disabled={!!updating}
            title="Approve booking"
            className="group relative p-1.5 rounded-lg hover:bg-green-50 text-slate-400 hover:text-green-600 transition-colors disabled:opacity-40">
            {updating === b.id + 'approve' ? <Loader2 size={size} className="animate-spin" /> : <Check size={size} />}
          </button>
          <button onClick={() => setReasonModal({ type: 'reject', booking: b })}
            disabled={!!updating}
            title="Reject booking"
            className="group relative p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors disabled:opacity-40">
            <X size={size} />
          </button>
        </>
      )}

      {/* CANCEL_REQUESTED → Approve cancellation / Reject (keep booking) */}
      {b.status === 'CANCEL_REQUESTED' && (
        <>
          <button onClick={() => handleCancelDecision(b.id, false)}
            disabled={!!updating}
            title="Reject cancellation — keep booking"
            className="group relative p-1.5 rounded-lg hover:bg-sky-50 text-slate-400 hover:text-sky-500 transition-colors disabled:opacity-40">
            {updating === b.id + 'cancelDecision' ? <Loader2 size={size} className="animate-spin" /> : <Check size={size} />}
          </button>
          <button onClick={() => handleCancelDecision(b.id, true)}
            disabled={!!updating}
            title="Approve cancellation + refund"
            className="group relative p-1.5 rounded-lg hover:bg-orange-50 text-slate-400 hover:text-orange-500 transition-colors disabled:opacity-40">
            <Ban size={size} />
          </button>
        </>
      )}

      {/* CONFIRMED → Force cancel */}
      {b.status === 'CONFIRMED' && (
        <button onClick={() => setReasonModal({ type: 'forceCancel', booking: b })}
          disabled={!!updating}
          title="Cancel booking (operator-side)"
          className="group relative p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors disabled:opacity-40">
          <Ban size={size} />
        </button>
      )}

      {/* Cancelled — show refund status only */}
      {isFinalCancelled(b.status) && b.refundStatus && (
        <StatusBadge status={b.refundStatus} />
      )}
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-slate-800">Manage Bookings</h2>
        <p className="text-slate-400 text-sm mt-0.5">
          {bookings.length} bookings · Confirmed Revenue: ₹{revenue.toLocaleString('en-IN')}
        </p>
      </div>

      {/* Toast */}
      {toast && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3">
          {toast}
        </div>
      )}

      {/* Cancel requests alert */}
      {cancelRequests > 0 && (
        <div className="mb-5 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 flex items-center gap-3 text-sm text-orange-700">
          <AlertTriangle size={16} className="flex-shrink-0" />
          <div>
            <span className="font-semibold">{cancelRequests} cancellation request{cancelRequests > 1 ? 's' : ''}</span>
            {' '}pending your review.
          </div>
          <button onClick={() => setFilter('CANCEL_REQUESTED')}
            className="ml-auto text-xs font-semibold underline hover:no-underline">
            Review now →
          </button>
        </div>
      )}

      {/* Policy Info */}
      <div className="mb-5 bg-sky-50 border border-sky-200 rounded-xl px-4 py-3 flex items-start gap-3 text-xs text-sky-700">
        <Info size={14} className="flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold">Cancellation Policy: </span>
          Cancel <span className="font-bold">7+ days</span> before tour → 100% Full Refund ✅ &nbsp;|&nbsp;
          Within 7 days → No Refund ❌ &nbsp;|&nbsp; Admin-initiated rejections/cancellations are always fully refunded.
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by ID, package..."
            className="form-input pl-9 text-sm w-full" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {STATUS_FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all
                ${filter === f
                  ? f === 'CANCEL_REQUESTED' ? 'bg-orange-500 text-white border-orange-500'
                  : 'bg-sky-500 text-white border-sky-500'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-sky-300'}`}>
              {f === 'CANCEL_REQUESTED' ? '⚠ Cancel Req.' : f === 'CANCELLED_BY_USER' ? 'Cancelled (User)' : f === 'CANCELLED_BY_ADMIN' ? 'Cancelled (Admin)' : f}
              <span className="ml-1 opacity-60">({f === 'All' ? bookings.length : bookings.filter(b => b.status === f).length})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>{['ID','User','Package','Booked On','Tour Date','Amount','Payment','Status','Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-slate-400 text-xs uppercase font-semibold tracking-wide whitespace-nowrap">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-12 text-slate-400">No bookings found</td></tr>
              ) : filtered.map(b => (
                <tr key={b.id}
                  className={`border-b border-slate-50 transition-colors
                    ${b.status === 'CANCEL_REQUESTED' ? 'bg-orange-50/50' : 'hover:bg-slate-50/60'}`}>
                  <td className="px-4 py-3 font-mono text-xs text-sky-600 font-semibold">#{b.bookingRef}</td>
                  <td className="px-4 py-3">
                    <div className="text-xs">
                      <p className="font-semibold text-slate-700">{b.userName}</p>
                      <p className="text-slate-400">{b.userEmail}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-700 font-medium text-xs max-w-[130px] truncate">{b.packageTitle}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{b.createdAt?.slice(0,10)}</td>
                  <td className="px-4 py-3 text-slate-600 text-xs font-medium">{b.travelDate}</td>
                  <td className="px-4 py-3 font-semibold text-slate-800 text-xs">₹{Number(b.totalAmount).toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full
                      ${b.paymentStatus === 'PAID'     ? 'bg-green-100 text-green-700' :
                        b.paymentStatus === 'REFUNDED' ? 'bg-red-100 text-red-600'    :
                        'bg-amber-100 text-amber-700'}`}>
                      {b.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                  <td className="px-4 py-3">{renderRowActions(b)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDetail(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-lg font-bold text-slate-800">#{detail.bookingRef}</h3>
              <button onClick={() => setDetail(null)} className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400">
                <X size={16} />
              </button>
            </div>

            {/* Booking details */}
            <div className="space-y-2.5 text-sm mb-5">
              {[
                ['Customer',    detail.userName],
                ['Email',       detail.userEmail],
                ['Phone',       detail.userPhone || '—'],
                ['Package',     detail.packageTitle],
                ['Destination', detail.packageLocation],
                ['Booked On',   detail.createdAt?.slice(0,10)],
                ['Tour Date',   detail.travelDate],
                ['Travelers',   detail.travelers],
                ['Amount',      `₹${Number(detail.totalAmount).toLocaleString('en-IN')}`],
                ['Payment',     detail.paymentStatus],
                ...(detail.razorpayPaymentId ? [['Payment ID', detail.razorpayPaymentId]] : []),
                ['Status',      detail.status],
                ...(detail.refundStatus ? [['Refund Status', detail.refundStatus]] : []),
                ...(detail.refundAmount != null ? [['Refund Amount', `₹${Number(detail.refundAmount).toLocaleString('en-IN')}`]] : []),
                ...(detail.adminNote ? [['Admin Note', detail.adminNote]] : []),
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between border-b border-slate-50 pb-2.5 gap-3">
                  <span className="text-slate-400 flex-shrink-0">{label}</span>
                  <span className="font-semibold text-slate-800 text-right">{val}</span>
                </div>
              ))}
            </div>

            {/* Download buttons */}
            <div className="flex gap-2.5 mb-4">
              <button onClick={() => handleDownloadReceipt(detail)}
                disabled={downloadingId === detail.id + '-receipt'}
                className="flex-1 border border-sky-200 text-sky-600 text-xs font-semibold py-2.5 rounded-xl flex items-center justify-center gap-1.5 disabled:opacity-60">
                {downloadingId === detail.id + '-receipt' ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
                Receipt
              </button>
              {detail.status === 'CONFIRMED' && (
                <button onClick={() => handleDownloadTicket(detail)}
                  disabled={downloadingId === detail.id + '-ticket'}
                  className="flex-1 border border-green-200 text-green-600 text-xs font-semibold py-2.5 rounded-xl flex items-center justify-center gap-1.5 disabled:opacity-60">
                  {downloadingId === detail.id + '-ticket' ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
                  E-Ticket
                </button>
              )}
            </div>

            {/* Refund info for cancel requests — preview only */}
            {detail.status === 'CANCEL_REQUESTED' && (() => {
              const refund = getRefundInfo(detail.travelDate, detail.totalAmount);
              return refund ? (
                <div className={`border rounded-xl p-4 mb-4 ${refund.bg}`}>
                  <p className={`text-sm font-semibold mb-2 ${refund.color}`}>
                    Cancellation Request — Refund Preview
                  </p>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Days until tour</span>
                      <span className="font-semibold text-slate-700">{refund.daysLeft} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Refund eligibility</span>
                      <span className={`font-bold ${refund.color}`}>{refund.label}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200 pt-1.5">
                      <span className="text-slate-500">Refund amount</span>
                      <span className={`font-bold text-base ${refund.color}`}>
                        ₹{refund.amount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              ) : null;
            })()}

            {/* Action buttons */}
            {detail.status === 'PENDING' && (
              <div className="flex gap-2.5">
                <button onClick={() => handleApprove(detail.id)} disabled={!!updating}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60">
                  <Check size={14} /> Approve
                </button>
                <button onClick={() => setReasonModal({ type: 'reject', booking: detail })} disabled={!!updating}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60">
                  <X size={14} /> Reject
                </button>
              </div>
            )}

            {detail.status === 'CANCEL_REQUESTED' && (
              <div className="flex gap-2.5">
                <button onClick={() => handleCancelDecision(detail.id, false)} disabled={!!updating}
                  className="flex-1 bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold py-2.5 rounded-xl flex items-center justify-center gap-1.5 disabled:opacity-60">
                  <Check size={13} /> Reject Request
                </button>
                <button onClick={() => handleCancelDecision(detail.id, true)} disabled={!!updating}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold py-2.5 rounded-xl flex items-center justify-center gap-1.5 disabled:opacity-60">
                  <Ban size={13} /> Approve + Refund
                </button>
              </div>
            )}

            {detail.status === 'CONFIRMED' && (
              <button onClick={() => setReasonModal({ type: 'forceCancel', booking: detail })} disabled={!!updating}
                className="w-full bg-red-500 hover:bg-red-600 text-white text-sm font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60">
                <Ban size={14} /> Cancel Booking
              </button>
            )}

            {isFinalCancelled(detail.status) && (
              <div className="text-center py-3 bg-red-50 rounded-xl text-red-500 text-sm font-medium">
                This booking has been cancelled
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Reason Modal — for Reject (PENDING) and Force Cancel (CONFIRMED) ── */}
      {reasonModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => { setReasonModal(null); setReasonText(''); }} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-bold text-slate-800">
                {reasonModal.type === 'reject' ? 'Reject Booking' : 'Cancel Booking'}
              </h3>
              <button onClick={() => { setReasonModal(null); setReasonText(''); }} className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400">
                <X size={16} />
              </button>
            </div>

            <p className="text-sm text-slate-500 mb-3">
              #{reasonModal.booking.bookingRef} — {reasonModal.booking.packageTitle}
            </p>

            <div className="bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5 text-xs text-amber-700 flex items-start gap-2 mb-4">
              <AlertTriangle size={13} className="flex-shrink-0 mt-0.5" />
              This will trigger a <b>full refund</b> via Razorpay (not the customer's fault — admin/operator initiated).
            </div>

            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Reason (shown to customer)</label>
            <textarea
              value={reasonText}
              onChange={e => setReasonText(e.target.value)}
              placeholder={reasonModal.type === 'reject' ? 'e.g. Package sold out for selected dates' : 'e.g. Tour cancelled due to low bookings'}
              rows={3}
              className="form-input w-full text-sm mb-5 resize-none"
            />

            <div className="flex gap-3">
              <button onClick={() => { setReasonModal(null); setReasonText(''); }} disabled={!!updating}
                className="flex-1 border border-slate-200 text-slate-600 rounded-xl py-2.5 text-sm font-medium hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleReasonSubmit} disabled={!!updating}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl py-2.5 text-sm font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                {updating ? <><Loader2 size={14} className="animate-spin" /> Processing...</> : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookings;