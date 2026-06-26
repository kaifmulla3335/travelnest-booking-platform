// Gray pulse placeholder — matches PackageCard's layout exactly so the page
// doesn't "jump" once real content replaces it.
const PackageCardSkeleton = () => (
  <div className="glass-card overflow-hidden flex flex-col animate-pulse">
    {/* Image */}
    <div className="w-full h-48 sm:h-44 md:h-48 bg-slate-200" />

    {/* Body */}
    <div className="p-4 flex flex-col flex-1 gap-2.5">
      <div className="h-3 w-20 bg-slate-200 rounded-full" />
      <div className="h-4 w-4/5 bg-slate-200 rounded-full" />
      <div className="h-4 w-3/5 bg-slate-200 rounded-full mb-1" />

      <div className="flex items-center gap-3">
        <div className="h-3 w-16 bg-slate-200 rounded-full" />
        <div className="h-3 w-16 bg-slate-200 rounded-full" />
      </div>

      <div className="flex-1" />
      <div className="flex items-center justify-between pt-3 border-t border-sky-100 mt-2">
        <div className="h-5 w-20 bg-slate-200 rounded-full" />
        <div className="h-8 w-24 bg-slate-200 rounded-full" />
      </div>
    </div>
  </div>
);

export default PackageCardSkeleton;