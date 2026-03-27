const config = {
  normal: {
    dot: 'bg-green-500',
    pill: 'bg-green-50 text-green-700 border border-green-200',
    label: 'Normal',
  },
  abnormal: {
    dot: 'bg-amber-500',
    pill: 'bg-amber-50 text-amber-700 border border-amber-200',
    label: 'Abnormal',
  },
  critical: {
    dot: 'bg-red-500 animate-pulse2',
    pill: 'bg-red-50 text-red-700 border border-red-200',
    label: 'Critical',
  },
  pending: {
    dot: 'bg-slate-400',
    pill: 'bg-slate-50 text-slate-500 border border-slate-200',
    label: 'Pending',
  },
};

const Badge = ({ status, className = '' }) => {
  const c = config[status] || config.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${c.pill} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.dot}`} />
      {c.label}
    </span>
  );
};

export default Badge;
