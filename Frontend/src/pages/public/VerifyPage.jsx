import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../../api/axios';
import { CheckCircle, XCircle, Loader2, Plane, Calendar, User, Hash } from 'lucide-react';

// Public page — opened directly by scanning the QR code on an E-Ticket.
// No login required. Always does a LIVE lookup (see PublicVerifyController on
// the backend), so this reflects the booking's CURRENT status, not whatever
// status existed when the PDF was generated.
const VerifyPage = () => {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [result,  setResult]  = useState(null);

  useEffect(() => {
    axiosInstance.get(`/public/verify/${token}`)
      .then(res => setResult(res.data))
      .catch(err => setResult(err.response?.data || { valid: false, message: 'Could not verify this ticket.' }))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-white flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">

        {/* Brand */}
        <div className="flex items-center justify-center gap-2 mb-6 text-sky-600">
          <Plane size={22} className="rotate-45" />
          <span className="font-display font-bold text-xl">TravelNest</span>
        </div>

        {loading ? (
          <div className="bg-white rounded-3xl shadow-xl p-10 flex flex-col items-center gap-3 text-slate-400">
            <Loader2 size={28} className="animate-spin" />
            <p className="text-sm">Verifying ticket...</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            {/* Status banner */}
            <div className={`p-6 text-center text-white ${result.valid ? 'bg-gradient-to-br from-green-400 to-emerald-500' : 'bg-gradient-to-br from-red-400 to-red-500'}`}>
              {result.valid
                ? <CheckCircle size={44} className="mx-auto mb-2" />
                : <XCircle size={44} className="mx-auto mb-2" />}
              <p className="font-display font-bold text-lg">{result.valid ? 'Valid Ticket' : 'Invalid Ticket'}</p>
              <p className="text-xs opacity-90 mt-0.5">{result.message}</p>
            </div>

            {/* Details — only shown when the token actually matched a booking */}
            {result.bookingRef && (
              <div className="p-5 space-y-3 text-sm">
                <div className="flex items-center gap-2.5 text-slate-700">
                  <Hash size={14} className="text-sky-400 flex-shrink-0" />
                  <span className="font-mono font-semibold">#{result.bookingRef}</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-700">
                  <Plane size={14} className="text-sky-400 flex-shrink-0" />
                  <span>{result.packageTitle}</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-700">
                  <Calendar size={14} className="text-sky-400 flex-shrink-0" />
                  <span>{result.travelDate}</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-700">
                  <User size={14} className="text-sky-400 flex-shrink-0" />
                  <span>{result.passengerName}</span>
                </div>
              </div>
            )}
          </div>
        )}

        <p className="text-center text-xs text-slate-400 mt-6">
          This verification is performed live against TravelNest's records.
        </p>
      </div>
    </div>
  );
};

export default VerifyPage;