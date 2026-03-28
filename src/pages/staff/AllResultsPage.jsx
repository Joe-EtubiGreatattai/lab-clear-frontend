import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getAllResultsApi } from '../../api/result.api';
import PageWrapper from '../../components/common/PageWrapper';
import Badge from '../../components/common/Badge';
import { TableRowSkeleton } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import useSocket from '../../hooks/useSocket';
import { format } from 'date-fns';
import { Search, FlaskConical, Eye, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

const PAGE_SIZE = 20;

const aiStatusChip = (aiStatus) => {
  if (aiStatus === 'done')
    return <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full font-medium"><Sparkles className="w-3 h-3" /> Ready</span>;
  if (aiStatus === 'failed')
    return <span className="text-xs text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full font-medium">Failed</span>;
  return <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full font-medium animate-pulse2">Generating…</span>;
};

const AllResultsPage = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchResults = useCallback(async (pg = 1) => {
    setLoading(true);
    try {
      const params = { page: pg, limit: PAGE_SIZE };
      if (statusFilter !== 'all') params.status = statusFilter;
      const { data } = await getAllResultsApi(params);
      setResults(data.results);
      setTotal(data.total);
      setTotalPages(data.pages);
      setPage(pg);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchResults(1);
  }, [fetchResults]);

  useSocket('result:new', () => {
    // Refresh first page on new result
    if (page === 1) fetchResults(1);
  });

  useSocket('ai:update', ({ resultId, aiStatus }) => {
    setResults((prev) => prev.map((r) => (r._id === resultId ? { ...r, aiStatus } : r)));
  });

  // Client-side search filter (over current page)
  const filtered = search.trim()
    ? results.filter((r) => {
        const q = search.toLowerCase();
        const name = r.patient ? `${r.patient.firstName} ${r.patient.lastName}` : '';
        return (
          r.testName?.toLowerCase().includes(q) ||
          name.toLowerCase().includes(q) ||
          r.patient?.mrn?.toLowerCase().includes(q)
        );
      })
    : results;

  return (
    <PageWrapper
      title={`All Results${total > 0 ? ` (${total})` : ''}`}
      subtitle="Browse and manage every result across all patients"
      action={
        <Link to="/staff/results/add" className="btn-primary">
          <FlaskConical className="w-4 h-4" /> Add Result
        </Link>
      }
    >
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by test, patient name, or MRN…"
            className="input-field pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="input-field sm:w-44"
        >
          <option value="all">All Statuses</option>
          <option value="normal">Normal</option>
          <option value="abnormal">Abnormal</option>
          <option value="critical">Critical</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {/* Mobile card list */}
      <div className="sm:hidden space-y-3 mb-2">
        {loading && Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card animate-pulse">
            <div className="h-4 bg-slate-100 rounded w-3/4 mb-2" />
            <div className="h-3 bg-slate-100 rounded w-1/2" />
          </div>
        ))}
        {!loading && filtered.length === 0 && (
          <EmptyState
            icon={FlaskConical}
            title="No results found"
            description={search ? `Nothing matched "${search}".` : 'No results have been added yet.'}
          />
        )}
        {!loading && filtered.map((r, i) => (
          <Link
            key={r._id}
            to={`/staff/results/${r._id}`}
            className="card block hover:border-primary-200 hover:shadow-md transition-all animate-fadeIn"
            style={{ animationDelay: `${Math.min(i, 10) * 0.03}s` }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-slate-800 text-sm leading-snug">{r.testName}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {r.patient ? `${r.patient.firstName} ${r.patient.lastName}` : '—'}
                  {r.patient?.mrn && <span className="ml-2 font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-400">{r.patient.mrn}</span>}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">{format(new Date(r.collectionDate), 'MMM d, yyyy')}</p>
              </div>
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <Badge status={r.status} />
                {aiStatusChip(r.aiStatus)}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Desktop table */}
      <div className="card overflow-hidden hidden sm:block">
        <div className="overflow-x-auto -mx-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-y border-slate-100 bg-slate-50/60">
                <th className="text-left py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wide">Test</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Patient</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">MRN</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Date</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">AI</th>
                <th className="text-right py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wide">View</th>
              </tr>
            </thead>
            <tbody>
              {loading &&
                Array.from({ length: PAGE_SIZE }).map((_, i) => <TableRowSkeleton key={i} cols={7} />)
              }
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-16">
                    <EmptyState
                      icon={FlaskConical}
                      title="No results found"
                      description={search ? `Nothing matched "${search}".` : 'No results have been added yet.'}
                    />
                  </td>
                </tr>
              )}
              {!loading && filtered.map((r, i) => (
                <tr
                  key={r._id}
                  className="border-b border-slate-50 hover:bg-primary-50/30 transition-colors animate-fadeIn"
                  style={{ animationDelay: `${Math.min(i, 10) * 0.03}s` }}
                >
                  <td className="py-3.5 px-6 font-semibold text-slate-800">{r.testName}</td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {r.patient ? `${r.patient.firstName} ${r.patient.lastName}` : '—'}
                  </td>
                  <td className="py-3.5 px-4 hidden sm:table-cell">
                    <span className="font-mono text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded">
                      {r.patient?.mrn || '—'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 text-xs hidden md:table-cell">
                    {format(new Date(r.collectionDate), 'MMM d, yyyy')}
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge status={r.status} />
                  </td>
                  <td className="py-3.5 px-4 hidden lg:table-cell">
                    {aiStatusChip(r.aiStatus)}
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    <Link
                      to={`/staff/results/${r._id}`}
                      className="inline-flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-700 font-semibold hover:bg-primary-50 px-2.5 py-1.5 rounded-lg transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" /> View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 pt-4 pb-2 border-t border-slate-100">
            <span className="text-xs text-slate-400">
              Page {page} of {totalPages} — {total} total
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => fetchResults(page - 1)}
                disabled={page <= 1}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                return (
                  <button
                    key={p}
                    onClick={() => fetchResults(p)}
                    className={`w-8 h-8 text-xs rounded-lg font-medium transition-colors ${
                      p === page
                        ? 'bg-primary-600 text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                onClick={() => fetchResults(page + 1)}
                disabled={page >= totalPages}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default AllResultsPage;
