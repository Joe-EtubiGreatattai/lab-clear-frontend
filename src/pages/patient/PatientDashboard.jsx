import { useState, useEffect, useMemo } from 'react';
import { getMyResultsApi, getResultApi } from '../../api/result.api';
import ResultCard from '../../components/patient/ResultCard';
import PageWrapper from '../../components/common/PageWrapper';
import { CardSkeleton } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import { useAuth } from '../../auth/AuthContext';
import useSocket from '../../hooks/useSocket';
import {
  FlaskConical, Search, X, ChevronDown,
  AlertTriangle, CheckCircle2, Clock, Activity,
} from 'lucide-react';
import { format } from 'date-fns';

const STATUS_OPTIONS = ['all', 'normal', 'abnormal', 'critical', 'pending'];

const PatientDashboard = () => {
  const { user } = useAuth();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    getMyResultsApi()
      .then(({ data }) => setResults(data.results))
      .catch(() => setError('Diagnostic synchronization failed'))
      .finally(() => setLoading(false));
  }, []);

  useSocket('result:new', ({ result }) => {
    setResults((prev) => (prev.find((r) => r._id === result._id) ? prev : [result, ...prev]));
  });

  useSocket('ai:update', ({ resultId, aiStatus }) => {
    setResults((prev) => prev.map((r) => (r._id === resultId ? { ...r, aiStatus } : r)));
  });

  useSocket('result:visibility', ({ resultId, isVisible }) => {
    if (!isVisible) {
      setResults((prev) => prev.filter((r) => r._id !== resultId));
    } else {
      getResultApi(resultId)
        .then(({ data }) => {
          setResults((prev) => {
            if (prev.find((r) => r._id === resultId)) return prev;
            return [...prev, data.result].sort((a, b) => new Date(b.collectionDate) - new Date(a.collectionDate));
          });
        })
        .catch(() => {});
    }
  });

  const filtered = useMemo(() => {
    let list = results;
    if (statusFilter !== 'all') list = list.filter((r) => r.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((r) => r.testName?.toLowerCase().includes(q) || r.labName?.toLowerCase().includes(q));
    }
    return list;
  }, [results, search, statusFilter]);

  const firstName = user?.name?.split(' ')[0] || 'Member';
  const today = format(new Date(), 'MMMM d, yyyy');
  const greeting = new Date().getHours() < 12 ? 'Good Morning' : 'Good Afternoon';

  return (
    <PageWrapper 
      title={<span>{greeting}, <span className="text-primary-600">{firstName}</span></span>}
      subtitle={`It's ${today}. You have ${results.length} medical records available in your personal diagnostic portal.`}
      action={
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-primary-50 border border-primary-100 rounded-2xl">
          <Activity className="w-4 h-4 text-primary-600 animate-glowPulse" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary-700">Digital Portal Status: Active</span>
        </div>
      }
    >
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1, 2, 3, 4].map((i) => <CardSkeleton key={i} />)}
        </div>
      )}

      {!loading && (
        <div className="space-y-16">
          {/* ── Status Metrics ── */}
          {results.length > 0 && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Total Files', value: results.length, icon: FlaskConical, color: 'text-surface-900', bg: 'bg-surface-100', filter: 'all' },
                { label: 'Normal', value: results.filter(r => r.status === 'normal').length, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', filter: 'normal' },
                { label: 'Attention', value: results.filter(r => r.status === 'abnormal').length, icon: Activity, color: 'text-amber-600', bg: 'bg-amber-50', filter: 'abnormal' },
                { label: 'Critical', value: results.filter(r => r.status === 'critical').length, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50', filter: 'critical' },
              ].map((stat, i) => (
                <button
                  key={stat.label}
                  onClick={() => setStatusFilter(stat.filter)}
                  className={`group p-8 rounded-[2rem] border-b-4 text-left transition-all duration-500 hover:-translate-y-1 ${
                    statusFilter === stat.filter ? 'bg-white border-primary-500 shadow-glow' : 'bg-white border-surface-200 shadow-card hover:shadow-hover'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 ${stat.bg} group-hover:scale-110`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} strokeWidth={2.5} />
                  </div>
                  <p className="text-4xl font-heading font-bold text-surface-900 tracking-tighter mb-1">{stat.value}</p>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-surface-400">{stat.label}</p>
                </button>
              ))}
            </div>
          )}

          {/* ── Results Directory ── */}
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 px-2">
              <div>
                <h3 className="font-heading font-bold text-3xl tracking-tighter text-surface-900 mb-1">Diagnostic Intelligence</h3>
                <p className="text-sm font-medium text-surface-400 uppercase tracking-widest">Medical History & AI Summaries</p>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                  <input
                    type="text"
                    placeholder="Search by test or clinic..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-white border border-surface-200 rounded-full pl-11 pr-5 py-2.5 text-sm focus:border-primary-400 focus:shadow-input transition-all w-full sm:w-64"
                  />
                </div>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="bg-white rounded-[3rem] p-20 shadow-card border border-surface-100 flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-surface-50 flex items-center justify-center mb-6">
                  <FlaskConical className="w-10 h-10 text-surface-300" />
                </div>
                <h4 className="font-heading font-bold text-2xl text-surface-900 mb-2">No Records Available</h4>
                <p className="text-surface-500 max-w-sm mb-8">Your clinical results will automatically materialize here once analyzed by the laboratory.</p>
                {results.length > 0 && (
                  <button onClick={() => { setSearch(''); setStatusFilter('all'); }} className="btn-secondary">Clear Search Filter</button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filtered.map((result, i) => (
                  <ResultCard key={result._id} result={result} index={i} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </PageWrapper>
  );
};

export default PatientDashboard;
