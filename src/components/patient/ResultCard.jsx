import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { FlaskConical, ChevronRight, Clock, Activity } from 'lucide-react';
import Badge from '../common/Badge';

const accentBorder = {
  normal:   'border-l-emerald-400',
  abnormal: 'border-l-amber-400',
  critical: 'border-l-red-400',
  pending:  'border-l-surface-500',
};

const criticalGlow = {
  critical: 'shadow-glow-red',
};

const ResultCard = ({ result, index = 0 }) => {
  const accent = accentBorder[result.status] || accentBorder.pending;
  const extraShadow = criticalGlow[result.status] || '';

  return (
    <Link
      to={`/patient/results/${result._id}`}
      className={`group flex items-center gap-4 rounded-[2rem] border border-surface-100 p-6
        bg-white border-l-4 ${accent} ${extraShadow}
        shadow-card hover:shadow-hover hover:border-surface-200
        hover:-translate-y-1 transition-all duration-500
        animate-fadeIn stagger-${Math.min(index + 1, 5)}`}
    >
      <div className="w-14 h-14 bg-surface-50 border border-surface-100 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-primary-50 group-hover:border-primary-100 transition-all duration-500">
        <FlaskConical className="w-6 h-6 text-surface-400 group-hover:text-primary-600" strokeWidth={2} />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-heading font-bold text-lg text-surface-900 group-hover:text-primary-700 transition-colors truncate tracking-tight leading-none">
          {result.testName}
        </h3>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="flex items-center gap-1.5 text-xs text-surface-500 font-medium">
            <Clock className="w-3.5 h-3.5 text-surface-300" />
            {format(new Date(result.collectionDate), 'MMM d, yyyy')}
          </span>
          {result.labName && (
            <span className="text-xs text-surface-400 font-medium truncate hidden sm:block">· {result.labName}</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="flex flex-col items-end gap-1.5 sm:flex-row sm:items-center sm:gap-2">
          <Badge status={result.status} />
          {result.aiStatus === 'done' && (
            <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-primary-600 bg-primary-50 border border-primary-100 px-3 py-1.5 rounded-full shadow-sm">
              <div className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-glowPulse" />
              <span className="hidden sm:inline">Diagnostic Analysis</span>
            </span>
          )}
        </div>
        <ChevronRight className="w-4 h-4 text-surface-400 group-hover:text-primary-400 group-hover:translate-x-0.5 transition-all" />
      </div>
    </Link>
  );
};

export default ResultCard;
