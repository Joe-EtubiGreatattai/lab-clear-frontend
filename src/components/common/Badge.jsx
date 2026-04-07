const config = {
  normal: {
    dot:   'bg-emerald-500',
    pill:  'bg-emerald-50 text-emerald-700 border border-emerald-100',
    label: 'Normal Range',
  },
  abnormal: {
    dot:   'bg-amber-500',
    pill:  'bg-amber-50 text-amber-700 border border-amber-100',
    label: 'Attention Required',
  },
  critical: {
    dot:   'bg-red-500 animate-glowPulse',
    pill:  'bg-red-50 text-red-600 border border-red-100',
    label: 'Critical Priority',
  },
  pending: {
    dot:   'bg-surface-300',
    pill:  'bg-surface-50 text-surface-400 border border-surface-200',
    label: 'Analysis Pending',
  },
};

const Badge = ({ status, className = '' }) => {
  const c = config[status] || config.pending;
  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${c.pill} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.dot}`} />
      {c.label}
    </span>
  );
};

export default Badge;
