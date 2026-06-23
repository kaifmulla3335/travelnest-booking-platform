const EmptyState = ({ icon = '🔍', title = 'Nothing found', subtitle = '' }) => (
  <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
    <span className="text-5xl">{icon}</span>
    <h3 className="text-slate-600 font-semibold text-lg">{title}</h3>
    {subtitle && <p className="text-slate-400 text-sm">{subtitle}</p>}
  </div>
);

export default EmptyState;
