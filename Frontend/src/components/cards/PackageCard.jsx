import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, Star, Users, Calendar, AlertCircle } from 'lucide-react';

const getImage = (pkg) => pkg?.imageUrl || pkg?.image || null;
const getBg    = (pkg) => pkg?.bg || 'from-sky-300 to-sky-500';
const getEmoji = (pkg) => pkg?.emoji || '✈️';

// Days left until tour
const getDaysLeft = (tourStartDate) => {
  if (!tourStartDate) return null;
  return Math.ceil((new Date(tourStartDate) - new Date()) / (1000*60*60*24));
};

const PackageCard = ({ pkg }) => {
  const navigate   = useNavigate();
  const [imgError, setImgError] = useState(false);
  const image    = getImage(pkg);
  const daysLeft = getDaysLeft(pkg.tourStartDate);
  const bookingClosed = daysLeft !== null && daysLeft < 7;

  return (
    <div
      onClick={() => navigate(`/packages/${pkg.id}`)}
      className="glass-card overflow-hidden cursor-pointer hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300 group flex flex-col"
    >
      {/* Image */}
      <div className="relative overflow-hidden">
        {!imgError && image ? (
          <img src={image} alt={pkg.title} onError={() => setImgError(true)}
            className="w-full h-48 sm:h-44 md:h-48 object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className={`w-full h-48 sm:h-44 md:h-48 bg-gradient-to-br ${getBg(pkg)} flex items-center justify-center`}>
            <span className="text-6xl drop-shadow-lg group-hover:scale-110 transition-transform duration-300">
              {getEmoji(pkg)}
            </span>
          </div>
        )}
        <span className="absolute top-3 right-3 bg-white/25 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full border border-white/30">
          {pkg.category}
        </span>
        <span className="absolute top-3 left-3 bg-black/30 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
          <Star size={10} className="text-amber-400 fill-amber-400" /> {pkg.rating}
        </span>

        {/* Tour date badge on image */}
        {pkg.tourStartDate && (
          <div className="absolute bottom-3 left-3">
            {bookingClosed ? (
              <span className="bg-red-500/90 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                <AlertCircle size={10} /> Booking Closed
              </span>
            ) : daysLeft !== null && daysLeft <= 30 ? (
              <span className="bg-amber-500/90 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                ⏰ {daysLeft} days left
              </span>
            ) : (
              <span className="bg-green-500/90 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                ✅ Booking Open
              </span>
            )}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-1 text-sky-500 text-xs font-semibold mb-1.5">
          <MapPin size={11} /> {pkg.location}
        </div>
        <h3 className="font-display font-semibold text-slate-800 text-base mb-2 leading-snug line-clamp-2">
          {pkg.title}
        </h3>

        <div className="flex items-center gap-3 text-xs text-slate-400 mb-2 flex-wrap">
          <span className="flex items-center gap-1"><Clock size={11} /> {pkg.duration}</span>
          <span className="flex items-center gap-1"><Users size={11} /> {pkg.availableSlots ?? pkg.slots ?? 0} slots</span>
        </div>

        {/* Tour dates row */}
        {pkg.tourStartDate && (
          <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
            <Calendar size={10} className="text-sky-400 flex-shrink-0" />
            <span>
              {new Date(pkg.tourStartDate).toLocaleDateString('en-IN', { day:'numeric', month:'short' })}
              {pkg.tourEndDate && ` – ${new Date(pkg.tourEndDate).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}`}
            </span>
          </div>
        )}

        {/* Booking deadline */}
        {pkg.bookingDeadline && !bookingClosed && (
          <div className="text-xs text-amber-600 font-medium mb-1">
            📅 Book by {new Date(pkg.bookingDeadline).toLocaleDateString('en-IN', { day:'numeric', month:'short' })}
          </div>
        )}

        {/* Cancellation note */}
        {pkg.tourStartDate && !bookingClosed && (
          <div className="text-xs text-green-600 mb-2">
            ✅ Free cancel 7+ days before tour
          </div>
        )}

        <div className="flex-1" />
        <div className="flex items-center justify-between pt-3 border-t border-sky-100 mt-2">
          <div>
            <span className="font-display text-lg font-bold text-sky-600">
              ₹{Number(pkg.price).toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-slate-400"> /person</span>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/packages/${pkg.id}`); }}
            className={`text-xs px-4 py-2 rounded-full font-semibold transition-all
              ${bookingClosed
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'btn-primary'}`}
            disabled={bookingClosed}>
            {bookingClosed ? 'Closed' : 'View Details'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PackageCard;