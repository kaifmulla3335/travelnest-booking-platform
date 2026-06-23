import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useSiteStore from '../../store/siteStore';
import { Shield, Lock, AlertCircle } from 'lucide-react';
import { createBooking } from '../../services/bookingService';
import useBookingStore from '../../store/bookingStore';
import axiosInstance from '../../api/axios';
import useAuthStore from '../../store/authStore';

const PaymentPage = () => {
  const navigate      = useNavigate();
  const { siteName }  = useSiteStore();
  const { addBooking } = useBookingStore();
  const { user }       = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [imgError, setImgError] = useState(false);

  const raw   = (() => { try { return JSON.parse(sessionStorage.getItem('tn_booking') || 'null'); } catch { return null; } })();
  const pkg       = raw?.pkg;
  const travelers = raw?.travelers || 1;
  const base  = raw?.base  || 0;
  const tax   = raw?.tax   || 0;
  const total = raw?.total || 0;

  // ── Finalize booking AFTER Razorpay payment is verified ──
  const finalizeBooking = async (razorpayResponse) => {
    try {
      const payload = JSON.parse(sessionStorage.getItem('tn_booking_payload') || '{}');

      // Attach payment proof — backend re-verifies this signature before saving
      payload.razorpayOrderId   = razorpayResponse.razorpay_order_id;
      payload.razorpayPaymentId = razorpayResponse.razorpay_payment_id;
      payload.razorpaySignature = razorpayResponse.razorpay_signature;

      const res = await createBooking(payload);
      const booking = res.data;

      addBooking({
        id: booking.bookingRef,
        packageTitle: booking.packageTitle,
        destination: booking.packageLocation,
        date: booking.travelDate,
        amount: booking.totalAmount,
        travelers: booking.travelers,
        status: booking.status,
      });

      sessionStorage.setItem('tn_booking_ref', booking.bookingRef);
      sessionStorage.setItem('tn_booking_id', booking.id);
      navigate('/success');
    } catch (err) {
      setError('Payment succeeded but booking creation failed: ' + (err.response?.data?.message || err.message));
      setLoading(false);
    }
  };

  // ── Main payment flow ──
  const handlePay = async () => {
    setError('');
    setLoading(true);

    try {
      // Step 1: Ask backend to create a Razorpay Order
      // NOTE: we send packageId + travelers, NOT a raw amount — the backend
      // recomputes the price itself so it can never be tampered with client-side.
      const orderRes = await axiosInstance.post('/payment/create-order', {
        packageId: pkg?.id,
        travelers: travelers,
      });
      const { orderId, amount, currency, keyId } = orderRes.data;

      // Step 2: Open Razorpay Checkout widget
      const options = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: siteName,
        description: pkg?.title || 'Travel Booking',
        image: '/favicon.svg',
        order_id: orderId,
        prefill: {
          name:  user?.name  || '',
          email: user?.email || '',
          contact: user?.phone?.replace('+91', '') || '',
        },
        theme: { color: '#0ea5e9' }, // sky-500

        // ── Called when payment succeeds ──
        handler: async function (response) {
          try {
            // Step 3: Verify payment signature with backend (security check)
            const verifyRes = await axiosInstance.post('/payment/verify', {
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
            });

            if (verifyRes.data.verified) {
              // Step 4: Payment genuine — now create the booking
              await finalizeBooking(response);
            } else {
              setError('Payment verification failed. Please contact support.');
              setLoading(false);
            }
          } catch (err) {
            setError('Payment verification failed: ' + (err.response?.data?.message || err.message));
            setLoading(false);
          }
        },

        // ── Called when user closes the popup without paying ──
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);

      // ── Called if payment itself fails (card declined, etc.) ──
      rzp.on('payment.failed', function (response) {
        setError('Payment failed: ' + response.error.description);
        setLoading(false);
      });

      rzp.open();
    } catch (err) {
      setError('Failed to start payment: ' + (err.response?.data?.message || err.message));
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="bg-gradient-to-br from-sky-50 to-white px-4 sm:px-5 pt-8 sm:pt-12 pb-6 text-center border-b border-sky-100">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-800 mb-1">Secure Payment</h1>
        <p className="text-slate-500 text-sm flex items-center justify-center gap-1.5">
          <Lock size={13} className="text-sky-500" /> Protected with 256-bit SSL encryption
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-5 py-6 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-8">

          {/* ── Payment Panel ── */}
          <div className="lg:col-span-2 glass-card p-5 sm:p-8">
            <h2 className="font-semibold text-slate-800 text-base sm:text-lg mb-5">Complete Your Payment</h2>

            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              Click the button below to open the secure Razorpay checkout. You can pay using
              Credit/Debit Card, UPI, Net Banking, or Wallets.
            </p>

            {/* Error message */}
            {error && (
              <div className="mb-5 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 flex items-start gap-2">
                <AlertCircle size={15} className="flex-shrink-0 mt-0.5" /> {error}
              </div>
            )}

            {/* Payment methods preview (visual only — Razorpay handles selection) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {['💳 Card', '📱 UPI', '🏦 Net Banking', '👛 Wallets'].map(m => (
                <div key={m} className="border border-sky-100 rounded-xl px-3 py-3 text-center text-xs font-medium text-slate-600 bg-sky-50/50">
                  {m}
                </div>
              ))}
            </div>

            {/* Security note */}
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-5">
              <Shield size={13} className="text-sky-400 flex-shrink-0" />
              Secured by Razorpay · SSL Encrypted · PCI DSS Compliant
            </div>

            {/* Pay button */}
            <button onClick={handlePay} disabled={loading}
              className="btn-primary w-full py-3.5 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Opening Razorpay...</>
              ) : (
                <><Lock size={14} /> Pay ₹{total.toLocaleString('en-IN')} — Powered by Razorpay</>
              )}
            </button>
          </div>

          {/* ── Order Summary ── */}
          <div className="glass-card p-5 h-fit lg:sticky lg:top-24">
            <h3 className="font-semibold text-slate-800 mb-4">Order Summary</h3>

            {pkg && (
              <div className="rounded-xl overflow-hidden mb-4 relative h-28">
                {!imgError && pkg.image ? (
                  <img src={pkg.image} alt={pkg.title}
                    className="w-full h-full object-cover"
                    onError={() => setImgError(true)} />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${pkg.bg}`} />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent flex items-end p-3">
                  <p className="text-white font-display font-bold text-sm leading-snug line-clamp-2">{pkg.title}</p>
                </div>
              </div>
            )}

            <div className="space-y-2 text-xs text-slate-600 mb-4">
              <div className="flex justify-between">
                <span>Base Amount</span>
                <span>₹{base.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Taxes (5%)</span>
                <span>₹{tax.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-800 border-t border-sky-100 pt-2 text-sm">
                <span>Total Payable</span>
                <span className="text-sky-600">₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5 text-xs text-amber-700 flex items-start gap-2">
              <span className="flex-shrink-0 mt-0.5">🎁</span>
              <span>You earn <b>{siteName} points</b> on this booking!</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PaymentPage;