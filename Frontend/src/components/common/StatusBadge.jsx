const STATUS_STYLES = {
  CONFIRMED:          'bg-green-100 text-green-700',
  PENDING:            'bg-amber-100 text-amber-700',
  CANCEL_REQUESTED:   'bg-orange-100 text-orange-700',
  CANCELLED_BY_USER:  'bg-red-100 text-red-600',
  CANCELLED_BY_ADMIN: 'bg-red-100 text-red-600',
  ACTIVE:             'bg-green-100 text-green-700',
  SUSPENDED:          'bg-red-100 text-red-600',
  PAID:               'bg-green-100 text-green-700',
  REFUNDED:           'bg-slate-100 text-slate-600',
  // Refund statuses (used on the same badge component for consistency)
  NOT_ELIGIBLE:       'bg-slate-100 text-slate-600',
  INITIATED:          'bg-sky-100 text-sky-700',
  COMPLETED:          'bg-green-100 text-green-700',
  FAILED:             'bg-red-100 text-red-600',
};

const STATUS_LABELS = {
  CANCEL_REQUESTED:   'Cancel Req.',
  CANCELLED_BY_USER:  'Cancelled (You)',
  CANCELLED_BY_ADMIN: 'Cancelled (Admin)',
  NOT_ELIGIBLE:       'No Refund',
};

const StatusBadge = ({ status }) => (
  <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap
    ${STATUS_STYLES[status] || 'bg-slate-100 text-slate-600'}`}>
    {STATUS_LABELS[status] || status}
  </span>
);

export default StatusBadge;