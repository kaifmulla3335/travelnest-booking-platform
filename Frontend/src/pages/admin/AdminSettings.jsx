import { useState, useEffect } from 'react';
import { Save, Bell, Globe, CreditCard, Eye, EyeOff, Check, Loader2 } from 'lucide-react';
import axiosInstance from '../../api/axios';
import useSiteStore from '../../store/siteStore';

// ── Reusable components ──────────────────────────────────────

const SectionCard = ({ icon: Icon, title, children }) => (
  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm mb-5">
    <div className="flex items-center gap-3 px-5 sm:px-6 py-4 border-b border-slate-100">
      <div className="w-8 h-8 bg-sky-50 rounded-lg flex items-center justify-center flex-shrink-0">
        <Icon size={16} className="text-sky-500" />
      </div>
      <h3 className="font-semibold text-slate-800 text-sm">{title}</h3>
    </div>
    <div className="px-5 sm:px-6 py-5">{children}</div>
  </div>
);

const Field = ({ label, children }) => (
  <div>
    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">{label}</label>
    {children}
  </div>
);

const Toggle = ({ label, desc, checked, onChange }) => (
  <div className="flex items-center justify-between py-3.5 border-b border-slate-100 last:border-0">
    <div className="pr-8 min-w-0">
      <p className="text-sm font-medium text-slate-700">{label}</p>
      {desc && <p className="text-xs text-slate-400 mt-0.5">{desc}</p>}
    </div>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      aria-checked={checked}
      role="switch"
      className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-250 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2
        ${checked ? 'bg-sky-500' : 'bg-slate-400'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-250
        ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  </div>
);

// ── Main Component ────────────────────────────────────────────

const DEFAULTS = {
  siteName: 'TravelNest', tagline: "India's #1 Travel Platform",
  supportEmail: 'hello@travelnest.in', supportPhone: '+919876543210', currency: 'INR',
  notifyNewBooking: true, notifyCancellation: true, notifyNewUser: false,
  notifyPaymentFail: true, notifyLowSlots: true, notifyDailyReport: false,
  razorpayKey: '', testMode: true, autoRefund: true,
};

const AdminSettings = () => {
  const [settings, setSettings] = useState(DEFAULTS);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [showKey,  setShowKey]  = useState(false);
  const [error,    setError]    = useState('');

  useEffect(() => {
    axiosInstance.get('/admin/settings')
      .then(res => setSettings({ ...DEFAULTS, ...res.data }))
      .catch(() => setError('Failed to load settings'))
      .finally(() => setLoading(false));
  }, []);

  const update = (field, value) => setSettings(s => ({ ...s, [field]: value }));

  const setSiteSettings = useSiteStore(s => s.setSiteSettings);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await axiosInstance.put('/admin/settings', settings);
      setSettings({ ...DEFAULTS, ...res.data });
      setSiteSettings(res.data);   // ← Update global store so Navbar/Footer reflect instantly
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20 gap-3 text-slate-400">
      <Loader2 size={20} className="animate-spin" /> Loading settings...
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-800">Settings</h2>
          <p className="text-slate-400 text-sm mt-0.5">Manage your platform configuration</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-sm flex-shrink-0 disabled:opacity-60">
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      {/* Success / Error */}
      {saved && (
        <div className="mb-5 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
          <Check size={15} /> Settings saved successfully!
        </div>
      )}
      {error && (
        <div className="mb-5 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
          ⚠️ {error}
        </div>
      )}

      {/* ── Site Information ── */}
      <SectionCard icon={Globe} title="Site Information">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Site Name">
            <input value={settings.siteName} onChange={e => update('siteName', e.target.value)}
              className="form-input text-sm" />
          </Field>
          <Field label="Tagline">
            <input value={settings.tagline} onChange={e => update('tagline', e.target.value)}
              className="form-input text-sm" />
          </Field>
          <Field label="Support Email">
            <input type="email" value={settings.supportEmail} onChange={e => update('supportEmail', e.target.value)}
              className="form-input text-sm" />
          </Field>
          <Field label="Support Phone">
            <input type="tel" value={settings.supportPhone} onChange={e => update('supportPhone', e.target.value)}
              className="form-input text-sm" />
          </Field>
          <Field label="Currency">
            <select value={settings.currency} onChange={e => update('currency', e.target.value)}
              className="form-input text-sm">
              <option value="INR">INR — Indian Rupee (₹)</option>
              <option value="USD">USD — US Dollar ($)</option>
              <option value="EUR">EUR — Euro (€)</option>
            </select>
          </Field>
        </div>
      </SectionCard>

      {/* ── Notifications ── */}
      <SectionCard icon={Bell} title="Notification Preferences">
        <Toggle label="New Booking Alert"     desc="Get notified when a new booking is made"        checked={settings.notifyNewBooking}   onChange={v => update('notifyNewBooking', v)} />
        <Toggle label="Booking Cancellation"  desc="Alert when a booking is cancelled"              checked={settings.notifyCancellation} onChange={v => update('notifyCancellation', v)} />
        <Toggle label="New User Registration" desc="Notify when a new user signs up"                checked={settings.notifyNewUser}      onChange={v => update('notifyNewUser', v)} />
        <Toggle label="Payment Failure Alert" desc="Immediate alert for failed payments"            checked={settings.notifyPaymentFail}  onChange={v => update('notifyPaymentFail', v)} />
        <Toggle label="Low Slot Warning"      desc="Warn when a package has less than 3 slots left" checked={settings.notifyLowSlots}     onChange={v => update('notifyLowSlots', v)} />
        <Toggle label="Daily Revenue Report"  desc="Receive a daily summary email at 9 AM"          checked={settings.notifyDailyReport}  onChange={v => update('notifyDailyReport', v)} />
      </SectionCard>

      {/* ── Payment ── */}
      <SectionCard icon={CreditCard} title="Payment — Razorpay">
        <div className="space-y-4">
          <Field label="Razorpay API Key">
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={settings.razorpayKey}
                onChange={e => update('razorpayKey', e.target.value)}
                placeholder="rzp_test_xxxxxxxxxxxxx"
                className="form-input text-sm pr-10" />
              <button type="button" onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showKey ? <EyeOff size={15}/> : <Eye size={15}/>}
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-1.5">
              Find this in Razorpay Dashboard → Settings → API Keys
            </p>
          </Field>

          <div className="pt-2 space-y-0 border-t border-slate-100">
            <Toggle label="Test Mode" desc="Use Razorpay sandbox — no real payments"
              checked={settings.testMode} onChange={v => update('testMode', v)} />
            <Toggle label="Auto-Refund on Cancellation" desc="Automatically process refunds when booking is cancelled"
              checked={settings.autoRefund} onChange={v => update('autoRefund', v)} />
          </div>

          <div className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-medium
            ${settings.testMode
              ? 'bg-amber-50 border border-amber-200 text-amber-700'
              : 'bg-green-50 border border-green-200 text-green-700'}`}>
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${settings.testMode ? 'bg-amber-400' : 'bg-green-500'}`} />
            {settings.testMode
              ? 'Test Mode active — no real charges'
              : 'Live Mode active — real payments enabled'}
          </div>
        </div>
      </SectionCard>

    </div>
  );
};

export default AdminSettings;