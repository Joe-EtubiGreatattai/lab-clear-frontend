import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getAllResultsApi } from '../../api/result.api';
import PageWrapper from '../../components/common/PageWrapper';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import useSocket from '../../hooks/useSocket';
import { format } from 'date-fns';
import { useAuth } from '../../auth/AuthContext';
import { Search, FlaskConical, Eye, ChevronLeft, ChevronRight, PlusCircle, XCircle, Activity, Shield, Globe } from 'lucide-react';

const PAGE_SIZE = 15;

const aiStatusChip = (aiStatus) => {
  if (aiStatus === 'done')
    return (
      <div className="flex items-center gap-2 text-emerald-600 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full">
        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
        <span className="text-[10px] font-bold uppercase tracking-widest">Analysis Ready</span>
      </div>
    );
  if (aiStatus === 'failed')
    return (
      <div className="flex items-center gap-2 text-red-500 px-3 py-1 bg-red-50 border border-red-100 rounded-full">
        <XCircle className="w-3.5 h-3.5" />
        <span className="text-[10px] font-bold uppercase tracking-widest">System Error</span>
      </div>
    );
  return (
    <div className="flex items-center gap-2 text-primary-600 px-3 py-1 bg-primary-50 border border-primary-100 rounded-full animate-pulse">
      <div className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-ping" />
      <span className="text-[10px] font-bold uppercase tracking-widest">Synthesizing...</span>
    </div>
  );
};

const AllResultsPage = () => {
  const { user } = useAuth();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [scope, setScope] = useState(user?.role === 'doctor' ? 'personal' : 'all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchResults = useCallback(async (pg = 1, searchQuery = '', s = scope) => {
    setLoading(true);
    try {
      const params = { page: pg, limit: PAGE_SIZE, scope: s };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (searchQuery.trim()) params.search = searchQuery;

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
    const timer = setTimeout(() => {
      fetchResults(1, search, scope);
    }, 400);
    return () => clearTimeout(timer);
  }, [fetchResults, search, scope]);

  useSocket('result:new', () => {
    if (page === 1) fetchResults(1, search);
  });

  useSocket('ai:update', ({ resultId, aiStatus }) => {
    setResults((prev) => prev.map((r) => (r._id === resultId ? { ...r, aiStatus } : r)));
  });

  return (
    <PageWrapper
      title={<span>Clinical <span className="text-primary-600">Archive</span></span>}
      subtitle={`Displaying ${total} diagnostics across the global medical registry.`}
      action={
        <Link to="/staff/results/add" className="btn-primary">
          <PlusCircle className="w-4 h-4" /> Register Result
        </Link>
      }
    >
      <div className="space-y-10">
        {/* Filters */}
        <div className="flex flex-col xl:flex-row gap-6">
          <div className="flex-1 flex flex-col sm:flex-row items-center gap-4">
            <div className="relative group flex-1 w-full">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400 group-focus-within:text-primary-500 transition-colors" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by diagnostic metric, patient, or MRN..."
                className="w-full bg-white border border-surface-200 rounded-full pl-14 pr-6 py-4 text-sm focus:border-primary-400 focus:shadow-input transition-all"
              />
            </div>

            {/* Scoping Toggle */}
            <div className="flex p-1 bg-surface-100 border border-surface-200 rounded-full w-full sm:w-auto flex-shrink-0">
              <button
                onClick={() => setScope('personal')}
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-200 ${
                  scope === 'personal'
                    ? 'bg-white text-primary-600 shadow-sm border border-surface-200/50'
                    : 'text-surface-500 hover:text-surface-700'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                My Results
              </button>
              <button
                onClick={() => setScope('all')}
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-200 ${
                  scope === 'all'
                    ? 'bg-white text-primary-600 shadow-sm border border-surface-200/50'
                    : 'text-surface-500 hover:text-surface-700'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                Global Search
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="bg-white border border-surface-200 rounded-full pl-6 pr-12 py-4 text-sm focus:border-primary-400 focus:shadow-input transition-all appearance-none font-bold uppercase tracking-widest text-[10px] text-surface-600 min-w-[200px]"
              >
                <option value="all">All Status Windows</option>
                <option value="normal">Normal Range</option>
                <option value="abnormal">Attention Required</option>
                <option value="critical">Critical Priority</option>
                <option value="pending">Analysis Pending</option>
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
                <div className="w-2 h-2 border-r-2 border-b-2 border-surface-400 rotate-45 -translate-y-0.5" />
              </div>
            </div>
          </div>
        </div>

        {!loading && results.length === 0 && (
          <div className="bg-white rounded-[3rem] p-24 shadow-card border border-surface-100 text-center">
            <EmptyState
              icon={FlaskConical}
              title="No Records Found"
              description={search ? `No diagnostics match the criteria: "${search}".` : 'The archive is currently empty.'}
            />
          </div>
        )}

        {/* Desktop Directory */}
        {(loading || results.length > 0) && (
          <div className="bg-white rounded-[3rem] shadow-card border border-surface-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-surface-100 bg-surface-50/50">
                    <th className="text-left py-6 px-10 text-[11px] font-bold text-surface-500 uppercase tracking-[0.2em]">Diagnostic Test</th>
                    <th className="text-left py-6 px-4 text-[11px] font-bold text-surface-500 uppercase tracking-[0.2em]">Subject Information</th>
                    <th className="text-left py-6 px-4 text-[11px] font-bold text-surface-500 uppercase tracking-[0.2em] hidden md:table-cell">Temporal Data</th>
                    <th className="text-left py-6 px-4 text-[11px] font-bold text-surface-500 uppercase tracking-[0.2em]">Clinical Status</th>
                    <th className="text-left py-6 px-4 text-[11px] font-bold text-surface-500 uppercase tracking-[0.2em] hidden lg:table-cell">AI Intelligence</th>
                    <th className="text-right py-6 px-10 text-[11px] font-bold text-surface-500 uppercase tracking-[0.2em]">View</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-50">
                  {loading && Array.from({ length: 10 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={6} className="p-8"><div className="h-4 bg-surface-100 rounded w-full" /></td>
                    </tr>
                  ))}
                  {!loading && results.map((r, i) => (
                    <tr
                      key={r._id}
                      className="group hover:bg-surface-50/50 transition-colors animate-fadeIn"
                      style={{ animationDelay: `${Math.min(i, 10) * 0.03}s` }}
                    >
                      <td className="py-6 px-10">
                        <p className="text-[17px] font-bold text-surface-900 tracking-tight leading-none group-hover:text-primary-700 transition-colors">{r.testName}</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-surface-400 mt-1.5">Laboratory Diagnostic</p>
                      </td>
                      <td className="py-6 px-4">
                        <div className="flex items-center gap-3">
                          <div className="space-y-0.5">
                            <p className="text-sm font-bold text-surface-800">{r.patient ? `${r.patient.firstName} ${r.patient.lastName}` : 'System Anonymous'}</p>
                            <p className="font-mono text-[10px] font-bold text-surface-400">MRN: {r.patient?.mrn || '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-6 px-4 hidden md:table-cell">
                        <p className="text-xs font-bold text-surface-600 font-mono tracking-tighter">
                          {format(new Date(r.collectionDate), 'MMM d, yyyy')}
                        </p>
                      </td>
                      <td className="py-6 px-4">
                        <Badge status={r.status} />
                      </td>
                      <td className="py-6 px-4 hidden lg:table-cell">
                        {aiStatusChip(r.aiStatus)}
                      </td>
                      <td className="py-6 px-10 text-right">
                        <Link
                          to={`/staff/results/${r._id}`}
                          className="w-10 h-10 rounded-full border border-surface-100 flex items-center justify-center text-surface-400 hover:bg-surface-900 hover:text-white transition-all duration-500"
                        >
                          <Eye className="w-5 h-5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Refinement */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-10 py-8 bg-surface-50/30 border-t border-surface-100">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-surface-400">
                  Registry Index {page} / {totalPages}
                </span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => fetchResults(page - 1, search)}
                    disabled={page <= 1}
                    className="p-3 rounded-full border border-surface-200 text-surface-400 hover:bg-white hover:text-surface-900 disabled:opacity-20 transition-all shadow-sm"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => fetchResults(page + 1, search)}
                    disabled={page >= totalPages}
                    className="p-3 rounded-full border border-surface-200 text-surface-400 hover:bg-white hover:text-surface-900 disabled:opacity-20 transition-all shadow-sm"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default AllResultsPage;
