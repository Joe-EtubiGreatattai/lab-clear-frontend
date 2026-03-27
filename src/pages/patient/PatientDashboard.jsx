import { useState, useEffect, useMemo } from 'react';
import { getMyResultsApi, getResultApi } from '../../api/result.api';
import ResultCard from '../../components/patient/ResultCard';
import PageWrapper from '../../components/common/PageWrapper';
import { CardSkeleton } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import { useAuth } from '../../auth/AuthContext';
import useSocket from '../../hooks/useSocket';
import { FlaskConical, Sparkles, Search, X } from 'lucide-react';
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
      .catch(() => setError('Failed to load results'))
      .finally(() => setLoading(false));
  }, []);

  useSocket('result:new', ({ result }) => {
    setResults((prev) => {
      if (prev.find((r) => r._id === result._id)) return prev;
      return [result, ...prev];
    });
  });

  useSocket('ai:update', ({ resultId, aiStatus }) => {
    setResults((prev) =>
      prev.map((r) => (r._id === resultId ? { ...r, aiStatus } : r))
    );
  });

  useSocket('result:visibility', ({ resultId, isVisible }) => {
    if (!isVisible) {
      setResults((prev) => prev.filter((r) => r._id !== resultId));
    } else {
      getResultApi(resultId)
        .then(({ data }) => {
          setResults((prev) => {
            if (prev.find((r) => r._id === resultId)) return prev;
            return [...prev, data.result].sort(
              (a, b) => new Date(b.collectionDate) - new Date(a.collectionDate)
            );
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
      list = list.filter(
        (r) =>
          r.testName?.toLowerCase().includes(q) ||
          r.labName?.toLowerCase().includes(q) ||
          r.testCode?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [results, search, statusFilter]);

  const firstName = user?.name?.split(' ')[0] || 'there';
  const today = format(new Date(), 'EEEE, MMMM d');

  return (
    <PageWrapper>
      {/* Welcome banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 via-primary-600 to-teal-500 p-6 sm:p-8 mb-8 animate-fadeIn">
        <div className="absolute inset-0 opacity-10">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full border border-white"
              style={{
                width: `${(i + 2) * 90}px`,
                height: `${(i + 2) * 90}px`,
                top: '50%', left: '60%',
                transform: 'translate(-50%, -50%)',
              }}
            />
          ))}
        </div>
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <p className="text-primary-100 text-sm font-medium mb-1">{today}</p>
            <h1 className="font-heading font-bold text-2xl sm:text-3xl text-white mb-2">
              Hello, {firstName}
            </h1>
            <p className="text-primary-100 text-sm max-w-md leading-relaxed">
              {results.length > 0
                ? `You have ${results.length} lab result${results.length !== 1 ? 's' : ''}. Click any result to see your easy-to-understand summary.`
                : 'Your lab results will appear here once uploaded by your lab.'}
            </p>
          </div>
          <div className="hidden sm:flex w-14 h-14 bg-white/15 rounded-2xl items-center justify-center flex-shrink-0">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
        </div>
      </div>

      {/* Skeleton while loading */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <CardSkeleton key={i} />)}
        </div>
      )}

      {!loading && error && (
        <div className="card text-center py-12 text-red-500 text-sm">{error}</div>
      )}

      {!loading && !error && (
        <>
          {results.length > 0 && (
            <div className="mb-4 flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by test name, lab, or code…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input-field pl-9 pr-8"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Status filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-field sm:w-40 capitalize"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s === 'all' ? 'All statuses' : s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
          )}

          {filtered.length === 0 && results.length === 0 && (
            <div className="card">
              <EmptyState
                icon={FlaskConical}
                title="No results yet"
                description="Your lab results will appear here as soon as your lab uploads them. You'll be able to read a simple AI explanation of each one."
              />
            </div>
          )}

          {filtered.length === 0 && results.length > 0 && (
            <div className="card text-center py-10 text-sm text-slate-500">
              No results match your search.{' '}
              <button
                onClick={() => { setSearch(''); setStatusFilter('all'); }}
                className="text-primary-600 hover:underline font-medium"
              >
                Clear filters
              </button>
            </div>
          )}

          {filtered.length > 0 && (
            <div>
              <h2 className="font-heading font-semibold text-sm text-slate-500 uppercase tracking-wider mb-4">
                {filtered.length === results.length
                  ? `Your Results (${results.length})`
                  : `Showing ${filtered.length} of ${results.length}`}
              </h2>
              <div className="space-y-3">
                {filtered.map((result, i) => (
                  <ResultCard key={result._id} result={result} index={i} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </PageWrapper>
  );
};

export default PatientDashboard;
