import { useState } from 'react';
import { Mail, Phone, MapPin, Send, Clock, MessageSquare, CheckCircle } from 'lucide-react';
import useSiteStore from '../../store/siteStore';

const getContactInfo = (phone, email) => [
  {
    icon: Phone,
    label: 'Phone',
    value: phone,
    sub: 'Mon–Sat, 9am–7pm IST',
    color: 'text-sky-500',
    bg: 'bg-sky-50',
  },
  {
    icon: Mail,
    label: 'Email',
    value: email,
    sub: 'We reply within 2 hours',
    color: 'text-green-500',
    bg: 'bg-green-50',
  },
  {
    icon: MapPin,
    label: 'Office',
    value: 'Mumbai, Maharashtra',
    sub: 'India — 400001',
    color: 'text-violet-500',
    bg: 'bg-violet-50',
  },
];

const ContactPage = () => {
  const { siteName, supportEmail, supportPhone } = useSiteStore();
  const CONTACT_INFO = getContactInfo(supportPhone, supportEmail);
  const [form, setForm]       = useState({ name:'', email:'', subject:'', message:'' });
  const [sent, setSent]       = useState(false);
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    setSent(true);
  };

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-br from-sky-50 to-white px-4 sm:px-5 pt-10 sm:pt-16 pb-8 sm:pb-12 text-center border-b border-sky-100">
        <span className="inline-block bg-sky-100 text-sky-600 rounded-full px-4 py-1 text-xs font-bold uppercase tracking-wide mb-3">
          Get in Touch
        </span>
        <h1 className="font-display text-2xl sm:text-4xl font-bold text-slate-800 mb-2">
          Contact Us
        </h1>
        <p className="text-slate-500 text-sm sm:text-base">
          We'd love to hear from you — reach out anytime
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-5 py-8 sm:py-14">

        {/* Contact info cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-8 sm:mb-10">
          {CONTACT_INFO.map(c => (
            <div key={c.label} className="glass-card p-4 sm:p-5 flex items-start gap-3 sm:flex-col sm:items-center sm:text-center">
              <div className={`w-10 h-10 ${c.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <c.icon size={18} className={c.color} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">{c.label}</p>
                <p className="text-sm font-semibold text-slate-800 leading-snug">{c.value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{c.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Form card */}
        <div className="glass-card p-5 sm:p-8">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-9 h-9 bg-sky-100 rounded-xl flex items-center justify-center">
              <MessageSquare size={17} className="text-sky-500" />
            </div>
            <h2 className="font-display text-lg sm:text-xl font-bold text-slate-800">Send a Message</h2>
          </div>

          {sent ? (
            <div className="text-center py-8">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={28} className="text-green-500" />
              </div>
              <h3 className="font-display text-lg font-bold text-slate-800 mb-2">Message Sent!</h3>
              <p className="text-slate-500 text-sm">We'll get back to you within 2 hours.</p>
              <button onClick={() => { setSent(false); setForm({ name:'', email:'', subject:'', message:'' }); }}
                className="btn-outline px-5 py-2 text-sm mt-4 rounded-full">
                Send Another
              </button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              {/* Name + Email — side by side on tablet+ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                    Your Name
                  </label>
                  <input name="name" required placeholder="Aarav Kumar"
                    value={form.name} onChange={onChange} className="form-input text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                    Email Address
                  </label>
                  <input name="email" type="email" required placeholder="you@example.com"
                    value={form.email} onChange={onChange} className="form-input text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                  Subject
                </label>
                <input name="subject" required placeholder="Package enquiry, Booking help..."
                  value={form.subject} onChange={onChange} className="form-input text-sm" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                  Message
                </label>
                <textarea name="message" required rows={4}
                  placeholder="Write your message here..."
                  value={form.message} onChange={onChange}
                  className="form-input text-sm resize-none" />
              </div>

              <button type="submit" disabled={loading}
                className="btn-primary w-full py-3 text-sm rounded-xl flex items-center justify-center gap-2 disabled:opacity-60">
                {loading
                  ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Sending...</>
                  : <><Send size={15} /> Send Message</>
                }
              </button>

              {/* Response time note */}
              <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 pt-1">
                <Clock size={12} className="text-sky-400" />
                Average response time: under 2 hours
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};

export default ContactPage;