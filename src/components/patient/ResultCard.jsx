import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { FlaskConical, ChevronRight, Clock, Sparkles } from 'lucide-react';
import Badge from '../common/Badge';

const accentBorder = {
  normal:   'border-l-green-400',
  abnormal: 'border-l-amber-400',
  critical: 'border-l-red-500',
  pending:  'border-l-slate-300',
};

const criticalBg = {
  critical: 'bg-red-50/60',
};

const ResultCard = ({ result, index = 0 }) => {
  const accent = accentBorder[result.status] || accentBorder.pending;
  const cardBg = criticalBg[result.status] || 'bg-white';

  return (
    <Link
      to={`/patient/results/${result._id}`}
      className={`group flex items-center gap-3 rounded-2xl border-l-4 border border-slate-100 px-4 py-3.5
        ${accent} ${cardBg}
        shadow-card hover:shadow-hover hover:-translate-y-0.5
        transition-all duration-200 animate-fadeIn stagger-${Math.min(index + 1, 5)}`}
    >
      <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-primary-100 transition-colors">
        <FlaskConical className="w-5 h-5 text-primary-600" strokeWidth={1.8} />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-heading font-semibold text-slate-900 text-sm group-hover:text-primary-700 transition-colors truncate">
          {result.testName}
        </h3>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="flex items-center gap-1 text-xs text-slate-400 flex-shrink-0">
            <Clock className="w-3 h-3" />
            {format(new Date(result.collectionDate), 'MMM d, yyyy')}
          </span>
          {result.labName && (
            <span className="text-xs text-slate-400 truncate hidden sm:block">{result.labName}</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="flex flex-col items-end gap-1.5 sm:flex-row sm:items-center sm:gap-2">
          <Badge status={result.status} />
          {result.aiStatus === 'done' && (
            <span className="flex items-center gap-1 text-xs text-primary-600 bg-primary-50 border border-primary-100 px-2 py-0.5 rounded-full font-medium">
              <Sparkles className="w-3 h-3" />
              <span className="hidden sm:inline">AI Ready</span>
            </span>
          )}
        </div>
        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all" />
      </div>
    </Link>
  );
};

export default ResultCard;
