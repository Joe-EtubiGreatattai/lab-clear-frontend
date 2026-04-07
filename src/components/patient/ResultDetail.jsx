import { Link, useLocation } from 'react-router-dom';
import { format } from 'date-fns';
import { AlertCircle, FlaskConical, Activity } from 'lucide-react';
import Badge from '../common/Badge';
import Spinner from '../common/Spinner';

const flagConfig = {
  L:  { label: 'Below Range',     bg: 'bg-amber-50 text-amber-700 border-amber-100', dot: 'bg-amber-400' },
  H:  { label: 'Above Range',     bg: 'bg-amber-50 text-amber-700 border-amber-100', dot: 'bg-amber-400' },
  LL: { label: 'Critically Low',  bg: 'bg-red-50 text-red-600 border-red-100',    dot: 'bg-red-500' },
  HH: { label: 'Critically High', bg: 'bg-red-50 text-red-600 border-red-100',    dot: 'bg-red-500' },
  A:  { label: 'Abnormal',        bg: 'bg-orange-50 text-orange-700 border-orange-100', dot: 'bg-orange-400'},
};

const AiSection = ({ result }) => {
  if (result.aiStatus === 'generating' || result.aiStatus === 'pending') {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary-100 border-t-primary-500 rounded-full animate-spin" />
          <Activity className="absolute inset-0 m-auto w-6 h-6 text-primary-500 animate-glowPulse" />
        </div>
        <div className="text-center">
          <p className="text-lg font-heading font-bold text-surface-900 tracking-tight">Synthesizing Clinical Intelligence</p>
          <p className="text-sm text-surface-400 mt-1">Our medical AI is interpreting your laboratory metrics...</p>
        </div>
      </div>
    );
  }

  if (result.aiStatus === 'failed') {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <div>
          <p className="text-lg font-heading font-bold text-surface-900">Analysis Interrupted</p>
          <p className="text-sm text-surface-400 mt-1">We encountered an issue synchronizing your AI summary.</p>
        </div>
      </div>
    );
  }

  if (!result.aiExplanation) return null;

  const paragraphs = result.aiExplanation.split('\n\n').filter(Boolean);

  return (
    <div className="space-y-10">
      {paragraphs.map((para, i) => {
        const boldMatch = para.match(/^\*\*(.+?)\*\*(.*)$/s);
        return (
          <div
            key={i}
            className="animate-fadeIn"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            {boldMatch ? (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8">
                <div className="md:col-span-4 lg:col-span-3">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary-600 mb-1">{boldMatch[1]}</h4>
                </div>
                <div className="md:col-span-10 lg:col-span-10 border-l-2 border-primary-50 pl-6 md:pl-10">
                  <p className="text-[17px] font-medium text-surface-700 leading-relaxed tracking-tight">{boldMatch[2].trim()}</p>
                </div>
              </div>
            ) : (
              <div className="border-l-2 border-surface-100 pl-6 md:pl-10">
                <p className="text-[17px] font-medium text-surface-700 leading-relaxed tracking-tight">{para}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const ResultDetail = ({ result }) => {
  const { pathname } = useLocation();
  const isStaff = pathname.startsWith('/staff');
  const chatPath = isStaff ? `/staff/results/${result._id}/chat` : `/patient/results/${result._id}/chat`;

  return (
    <div className="space-y-12 animate-fadeIn pb-20">

    {/* ── Editorial Header Summary ── */}
    <div className="bg-white rounded-[3rem] p-10 md:p-14 shadow-card border border-surface-100 flex flex-col md:flex-row gap-10 md:items-center">
      <div className="flex-1 space-y-6">
        <div className="flex items-center gap-4">
          <Badge status={result.status} className="!uppercase !tracking-[0.2em] !text-[10px] !px-4 !py-1.5" />
          <div className="h-4 w-px bg-surface-200" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-surface-400">Order ID: {result.testCode || result._id.slice(-8)}</span>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-heading font-bold text-surface-900 tracking-tighter leading-none">
          {result.testName}
        </h1>
        
        <div className="flex flex-wrap gap-x-10 gap-y-4 pt-2">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-surface-400">Clinic Provider</p>
            <p className="text-sm font-semibold text-surface-700">{result.labName || 'Clinical Analytics'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-surface-400">Collection Date</p>
            <p className="text-sm font-semibold text-surface-700">{format(new Date(result.collectionDate), 'MMMM d, yyyy')}</p>
          </div>
          {result.patient && (
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-surface-400">Subject Account</p>
              <p className="text-sm font-semibold text-surface-700">{result.patient.firstName} {result.patient.lastName}</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="hidden lg:flex w-24 h-24 rounded-full bg-primary-50 border border-primary-100 items-center justify-center flex-shrink-0">
        <Activity className="w-10 h-10 text-primary-500 animate-glowPulse" strokeWidth={1.5} />
      </div>
    </div>

    {/* ── AI Diagnostic Intelligence ── */}
    <section className="bg-white rounded-[3rem] p-10 md:p-14 shadow-card border border-surface-100 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50/50 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
      
      <div className="flex items-center gap-3 mb-16 relative">
        <FlaskConical className="w-6 h-6 text-primary-500" />
        <div>
          <h3 className="font-heading font-bold text-2xl tracking-tighter text-surface-900 leading-tight">Diagnostic Summary</h3>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-surface-400 mt-0.5">Automated Intelligence Analysis</p>
        </div>
      </div>
      
      <AiSection result={result} />
    </section>

    {/* ── Comprehensive Laboratory Data ── */}
    <section>
      <div className="flex items-end justify-between px-6 mb-8">
        <div>
          <h3 className="font-heading font-bold text-2xl tracking-tighter text-surface-900">Laboratory Metrics</h3>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-surface-400 mt-1">Raw Clinical Observations</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-surface-500">
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
          Secure Clinical Protocol
        </div>
      </div>

      <div className="bg-white rounded-[3rem] shadow-card border border-surface-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-surface-100 bg-surface-50/50">
                <th className="text-left py-6 px-10 text-[11px] font-bold text-surface-500 uppercase tracking-[0.2em]">Clinical Bio-Marker</th>
                <th className="text-right py-6 px-4 text-[11px] font-bold text-surface-500 uppercase tracking-[0.2em]">Diagnostic Value</th>
                <th className="text-right py-6 px-4 text-[11px] font-bold text-surface-500 uppercase tracking-[0.2em] hidden sm:table-cell">Reference Window</th>
                <th className="text-right py-6 px-10 text-[11px] font-bold text-surface-500 uppercase tracking-[0.2em]">Status Flag</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-50">
              {result.rawResults?.map((item, i) => (
                <tr
                  key={i}
                  className="group hover:bg-surface-50/50 transition-colors"
                >
                  <td className="py-6 px-10">
                    <p className="text-[15px] font-bold text-surface-900 tracking-tight leading-none group-hover:text-primary-700 transition-colors">{item.name}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-surface-400 mt-1.5">Lab Metric</p>
                  </td>
                  <td className="py-6 px-4 text-right">
                    <div className="flex flex-col items-end">
                      <span className="text-[17px] font-bold font-mono text-surface-900 leading-none">
                        {item.value}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-surface-400 mt-1">{item.unit || 'Units'}</span>
                    </div>
                  </td>
                  <td className="py-6 px-4 text-right hidden sm:table-cell">
                    <span className="text-xs font-bold font-mono text-surface-400 px-3 py-1 bg-surface-100 rounded-lg group-hover:bg-white group-hover:text-surface-600 transition-colors">
                      {item.referenceRange || 'Standard Range Not Provided'}
                    </span>
                  </td>
                  <td className="py-6 px-10 text-right">
                    {item.flag ? (
                      <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border ${flagConfig[item.flag]?.bg || 'bg-surface-100 text-surface-500 border-surface-200'} transition-all`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${flagConfig[item.flag]?.dot || 'bg-surface-400'} animate-glowPulse`} />
                        <span className="text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">
                          {flagConfig[item.flag]?.label || item.flag}
                        </span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">Normal Range</span>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <div className="p-10 rounded-[3rem] bg-white border border-surface-100 shadow-card relative overflow-hidden group text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50/50 rounded-full blur-3xl -mr-32 -mt-32 group-hover:bg-primary-100/50 transition-colors duration-700" />
      <div className="relative z-10">
        <h4 className="font-heading font-bold text-2xl tracking-tighter text-surface-900 mb-2">Discuss your results</h4>
        <p className="text-surface-500 leading-relaxed text-sm">Need clarification on specific metrics? Initiate a secure intelligence chat with our medical agent.</p>
      </div>
      <Link to={chatPath} className="btn-primary !px-10 !py-4 !rounded-full relative z-10 whitespace-nowrap shadow-glow-primary">
        Start Intelligence Chat
      </Link>
    </div>
  </div>
  );
};

export default ResultDetail;
