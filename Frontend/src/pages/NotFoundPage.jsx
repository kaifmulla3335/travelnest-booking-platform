import { useNavigate } from 'react-router-dom';
import { Plane, Home, MapPin, Search } from 'lucide-react';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-sky-50 to-white flex items-center justify-center px-4 py-16">
      <div className="text-center max-w-md">

        {/* Illustration */}
        <div className="relative w-28 h-28 mx-auto mb-6">
          <div className="absolute inset-0 bg-sky-100 rounded-full" />
          <Plane size={48} className="absolute inset-0 m-auto text-sky-500 rotate-45" />
          <MapPin size={20} className="absolute -bottom-1 -right-1 text-amber-400" />
        </div>

        <p className="font-display text-6xl font-bold text-sky-200 mb-1">404</p>
        <h1 className="font-display text-2xl font-bold text-slate-800 mb-2">
          Looks like you've wandered off the map
        </h1>
        <p className="text-slate-500 text-sm mb-8">
          The page you're looking for doesn't exist, or may have moved.
          Let's get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={() => navigate('/')}
            className="btn-primary px-5 py-3 text-sm rounded-xl flex items-center justify-center gap-2">
            <Home size={15} /> Go Home
          </button>
          <button onClick={() => navigate('/packages')}
            className="btn-outline px-5 py-3 text-sm rounded-xl flex items-center justify-center gap-2">
            <Search size={15} /> Explore Packages
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;