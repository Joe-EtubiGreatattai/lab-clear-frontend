const colorMap = {
  teal:  { bg: 'bg-primary-400/10',  icon: 'text-primary-400',  num: 'text-primary-400',  border: 'border-primary-400/20'  },
  blue:  { bg: 'bg-blue-400/10',     icon: 'text-blue-400',     num: 'text-blue-400',     border: 'border-blue-400/20'     },
  amber: { bg: 'bg-amber-400/10',    icon: 'text-amber-400',    num: 'text-amber-400',    border: 'border-amber-400/20'    },
  green: { bg: 'bg-emerald-400/10',  icon: 'text-emerald-400',  num: 'text-emerald-400',  border: 'border-emerald-400/20'  },
  red:   { bg: 'bg-red-400/10',      icon: 'text-red-400',      num: 'text-red-400',      border: 'border-red-400/20'      },
  slate: { bg: 'bg-surface-600/60',  icon: 'text-surface-100',  num: 'text-surface-50',   border: 'border-surface-600'    },
};

const StatCard = ({ icon: Icon, label, value, color = 'teal', onClick }) => {
  const c = colorMap[color] || colorMap.teal;
  const Tag = onClick ? 'button' : 'div';

  return (
    <Tag
      onClick={onClick}
      className={`card flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4 w-full text-left p-3 sm:p-6
        ${onClick ? 'hover:shadow-hover hover:border-primary-400/20 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer' : ''}`}
    >
      <div className={`w-9 h-9 sm:w-12 sm:h-12 ${c.bg} border ${c.border} rounded-xl flex items-center justify-center flex-shrink-0`}>
        {Icon && <Icon className={`w-4 h-4 sm:w-6 sm:h-6 ${c.icon}`} strokeWidth={1.8} />}
      </div>
      <div className="text-center sm:text-left">
        <p className={`text-lg sm:text-2xl font-heading font-bold ${c.num}`}>{value ?? '—'}</p>
        <p className="text-[10px] sm:text-xs text-surface-200 font-medium mt-0.5 leading-tight">{label}</p>
      </div>
    </Tag>
  );
};

export default StatCard;
