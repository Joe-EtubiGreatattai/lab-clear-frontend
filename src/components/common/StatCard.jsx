const colorMap = {
  teal:   { bg: 'bg-primary-50',  icon: 'text-primary-600',  num: 'text-primary-700' },
  blue:   { bg: 'bg-blue-50',     icon: 'text-blue-600',     num: 'text-blue-700'    },
  amber:  { bg: 'bg-amber-50',    icon: 'text-amber-600',    num: 'text-amber-700'   },
  green:  { bg: 'bg-green-50',    icon: 'text-green-600',    num: 'text-green-700'   },
  red:    { bg: 'bg-red-50',      icon: 'text-red-600',      num: 'text-red-700'     },
  slate:  { bg: 'bg-slate-100',   icon: 'text-slate-500',    num: 'text-slate-700'   },
};

const StatCard = ({ icon: Icon, label, value, color = 'teal', onClick }) => {
  const c = colorMap[color] || colorMap.teal;
  const Tag = onClick ? 'button' : 'div';

  return (
    <Tag
      onClick={onClick}
      className={`card flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4 w-full text-left p-3 sm:p-6 ${onClick ? 'card-hover' : ''}`}
    >
      <div className={`w-9 h-9 sm:w-12 sm:h-12 ${c.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
        {Icon && <Icon className={`w-4 h-4 sm:w-6 sm:h-6 ${c.icon}`} strokeWidth={1.8} />}
      </div>
      <div className="text-center sm:text-left">
        <p className={`text-lg sm:text-2xl font-heading font-bold ${c.num}`}>{value ?? '—'}</p>
        <p className="text-[10px] sm:text-xs text-slate-500 font-medium mt-0.5 leading-tight">{label}</p>
      </div>
    </Tag>
  );
};

export default StatCard;
