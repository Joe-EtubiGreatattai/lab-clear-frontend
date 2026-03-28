import { format } from 'date-fns';
import { Sparkles, AlertCircle, FlaskConical } from 'lucide-react';
import Badge from '../common/Badge';
import Spinner from '../common/Spinner';

const flagConfig = {
  L:  { label: 'Low',            bg: 'bg-amber-50 text-amber-700 border-amber-200'  },
  H:  { label: 'High',           bg: 'bg-amber-50 text-amber-700 border-amber-200'  },
  LL: { label: 'Critically Low',  bg: 'bg-red-50 text-red-700 border-red-200'        },
  HH: { label: 'Critically High', bg: 'bg-red-50 text-red-700 border-red-200'        },
  A:  { label: 'Abnormal',        bg: 'bg-orange-50 text-orange-700 border-orange-200'},
};

const AiSection = ({ result }) => {
  if (result.aiStatus === 'generating' || result.aiStatus === 'pending') {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <Spinner size="md" message="Generating your personalized summary…" />
        <p className="text-xs text-slate-400 max-w-xs text-center">
          Our AI is reading your results and writing a clear explanation just for you.
        </p>
      </div>
    );
  }

  if (result.aiStatus === 'failed') {
    return (
      <div className="flex flex-col items-center gap-3 py-10">
        <AlertCircle className="w-8 h-8 text-red-400" />
        <p className="text-sm text-red-500 font-medium">Summary generation failed</p>
        <p className="text-xs text-slate-400">Please contact the lab to regenerate.</p>
      </div>
    );
  }

  if (!result.aiExplanation) return null;

  const paragraphs = result.aiExplanation.split('\n\n').filter(Boolean);
  const sectionColors = [
    'border-l-primary-400',
    'border-l-teal-400',
    'border-l-blue-400',
    'border-l-indigo-400',
  ];

  return (
    <div className="space-y-4">
      {paragraphs.map((para, i) => {
        const boldMatch = para.match(/^\*\*(.+?)\*\*(.*)$/s);
        return (
          <div
            key={i}
            className={`pl-4 border-l-2 ${sectionColors[i % sectionColors.length]} animate-fadeIn`}
            style={{ animationDelay: `${i * 0.08}s` }}
          >
            {boldMatch ? (
              <>
                <p className="text-sm font-semibold text-slate-800 mb-1">{boldMatch[1]}</p>
                <p className="text-sm text-slate-600 leading-relaxed">{boldMatch[2].trim()}</p>
              </>
            ) : (
              <p className="text-sm text-slate-600 leading-relaxed">{para}</p>
            )}
          </div>
        );
      })}
    </div>
  );
};

const ResultDetail = ({ result }) => (
  <div className="space-y-4 animate-fadeIn">

    {/* Header card */}
    <div className="card">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
          <FlaskConical className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" strokeWidth={1.8} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h2 className="font-heading font-bold text-lg sm:text-xl text-slate-900 leading-tight">
              {result.testName}
            </h2>
            <Badge status={result.status} className="flex-shrink-0 mt-0.5" />
          </div>
          {result.testCode && (
            <span className="text-xs text-slate-400 font-mono">Code: {result.testCode}</span>
          )}
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-xs text-slate-500">
            <span>Collected: {format(new Date(result.collectionDate), 'MMM d, yyyy')}</span>
            {result.labName && <span className="truncate max-w-[180px] sm:max-w-none">{result.labName}</span>}
            {result.patient && (
              <span>Patient: {result.patient.firstName} {result.patient.lastName}</span>
            )}
          </div>
        </div>
      </div>
    </div>

    {/* AI Summary */}
    <div className="card">
      <div className="-mx-6 -mt-6 mb-5 px-6 py-4 bg-gradient-to-r from-primary-600 to-teal-500 rounded-t-2xl">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-white" />
          <h3 className="font-heading font-bold text-white text-sm sm:text-base">Plain English Summary</h3>
        </div>
        <p className="text-primary-100 text-xs mt-0.5">AI-generated explanation of your results</p>
      </div>
      <AiSection result={result} />
    </div>

    {/* Raw results table */}
    <div className="card">
      <h3 className="font-heading font-semibold text-slate-800 mb-3 text-sm">Your Results</h3>
      <div className="overflow-x-auto -mx-2">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left pb-2 px-2 text-slate-400 font-semibold">Test</th>
              <th className="text-right pb-2 px-2 text-slate-400 font-semibold">Value</th>
              <th className="text-right pb-2 px-2 text-slate-400 font-semibold hidden sm:table-cell">Range</th>
              <th className="text-right pb-2 px-2 text-slate-400 font-semibold">Flag</th>
            </tr>
          </thead>
          <tbody>
            {result.rawResults?.map((item, i) => (
              <tr
                key={i}
                className={`border-b border-slate-50 ${i % 2 === 0 ? 'bg-slate-50/50' : ''}`}
              >
                <td className="py-2.5 px-2 font-medium text-slate-800 leading-snug">{item.name}</td>
                <td className="py-2.5 px-2 text-right text-slate-700 font-mono whitespace-nowrap">
                  {item.value}{item.unit ? ` ${item.unit}` : ''}
                </td>
                <td className="py-2.5 px-2 text-right text-slate-400 hidden sm:table-cell whitespace-nowrap">
                  {item.referenceRange || '—'}
                </td>
                <td className="py-2.5 px-2 text-right">
                  {item.flag ? (
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded border text-xs font-medium whitespace-nowrap ${flagConfig[item.flag]?.bg || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                      {flagConfig[item.flag]?.label || item.flag}
                    </span>
                  ) : (
                    <span className="text-green-600 font-medium">✓</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export default ResultDetail;
