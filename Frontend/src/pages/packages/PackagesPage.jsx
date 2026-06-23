import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { usePackages } from '../../hooks/usePackages';
import PackageCard from '../../components/cards/PackageCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { Search, SlidersHorizontal, ChevronDown } from 'lucide-react';

const CATEGORIES = ['All','Beach','Mountain','Cultural','Adventure','Wildlife','Luxury'];

const PackagesPage = () => {
  const { packages, loading } = usePackages();
  const [searchParams] = useSearchParams();
  const [search, setSearch]     = useState(searchParams.get('q') || '');
  const [filter, setFilter]     = useState(searchParams.get('cat') || 'All');
  const [sort, setSort]         = useState('default');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let list = packages;
    if (filter !== 'All') list = list.filter(p => p.category === filter);
    if (search) list = list.filter(p =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.location.toLowerCase().includes(search.toLowerCase())
    );
    if (sort === 'price-asc')  list = [...list].sort((a,b) => a.price - b.price);
    if (sort === 'price-desc') list = [...list].sort((a,b) => b.price - a.price);
    if (sort === 'rating')     list = [...list].sort((a,b) => b.rating - a.rating);
    return list;
  }, [packages, filter, search, sort]);

  return (
    <div>
      {/* Page Hero — compact on mobile */}
      <div className="bg-gradient-to-br from-sky-50 to-white px-4 sm:px-5 pt-8 sm:pt-12 pb-6 sm:pb-8 text-center border-b border-sky-100">
        <h1 className="font-display text-2xl sm:text-4xl font-bold text-slate-800 mb-1.5 sm:mb-2">
          Explore All Packages
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm">Find your perfect getaway from our curated collection</p>
      </div>

      {/* ── Filter Bar — redesigned for mobile ── */}
      <div className="sticky top-16 z-40 bg-white/90 backdrop-blur-md border-b border-sky-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 py-2.5 sm:py-3">

          {/* Row 1: Search + Filter toggle (mobile) / full bar (desktop) */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search packages..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="form-input pl-8 pr-3 text-sm py-2 w-full rounded-full"
              />
            </div>

            {/* Sort — visible on desktop, hidden on mobile */}
            <select value={sort} onChange={e => setSort(e.target.value)}
              className="hidden sm:block form-input text-xs py-2 w-36 rounded-full">
              <option value="default">Default</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
              <option value="rating">Top Rated</option>
            </select>

            {/* Mobile filter toggle button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`sm:hidden flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold border transition-all
                ${filter !== 'All' ? 'bg-sky-500 text-white border-sky-500' : 'bg-white text-slate-600 border-slate-200'}`}>
              <SlidersHorizontal size={13} />
              Filter
              {filter !== 'All' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
            </button>
          </div>

          {/* Row 2: Category chips — scrollable on mobile, wrap on desktop */}
          <div className={`${showFilters ? 'block' : 'hidden'} sm:block mt-2`}>
            {/* Mobile: horizontal scroll */}
            <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 sm:flex-wrap scrollbar-hide">
              {CATEGORIES.map(c => (
                <button key={c}
                  onClick={() => { setFilter(c); if(window.innerWidth < 640) setShowFilters(false); }}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all
                    ${filter === c
                      ? 'bg-sky-500 text-white border-sky-500'
                      : 'bg-white text-slate-500 border-slate-200 hover:border-sky-300'}`}>
                  {c}
                </button>
              ))}

              {/* Sort on mobile — inside expanded filter */}
              <select value={sort} onChange={e => setSort(e.target.value)}
                className="sm:hidden flex-shrink-0 text-xs py-1.5 px-3 rounded-full border border-slate-200 bg-white text-slate-500 outline-none">
                <option value="default">Default</option>
                <option value="price-asc">Price ↑</option>
                <option value="price-desc">Price ↓</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-3 sm:px-5 py-4 sm:py-8">
        {loading ? (
          <LoadingSpinner text="Loading packages..." />
        ) : filtered.length === 0 ? (
          <EmptyState icon="🔍" title="No packages found" subtitle="Try a different search or filter" />
        ) : (
          <>
            <p className="text-slate-400 text-xs sm:text-sm mb-3 sm:mb-5">
              {filtered.length} package{filtered.length !== 1 ? 's' : ''} found
              {filter !== 'All' && <span className="ml-1 text-sky-500 font-medium">in {filter}</span>}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
              {filtered.map(pkg => <PackageCard key={pkg.id} pkg={pkg} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PackagesPage;