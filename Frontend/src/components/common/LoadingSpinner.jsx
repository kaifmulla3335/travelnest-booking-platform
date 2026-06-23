const LoadingSpinner = ({ text = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center py-20 gap-4">
    <div className="w-12 h-12 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin" />
    <p className="text-slate-400 text-sm">{text}</p>
  </div>
);

export default LoadingSpinner;
