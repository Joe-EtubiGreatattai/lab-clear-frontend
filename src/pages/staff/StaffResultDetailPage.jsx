import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getResultApi, toggleVisibilityApi, regenerateAiApi, deleteResultApi, sendReportEmailApi } from '../../api/result.api';
import ResultDetail from '../../components/patient/ResultDetail';
import PageWrapper from '../../components/common/PageWrapper';
import Spinner from '../../components/common/Spinner';
import useSocket from '../../hooks/useSocket';
import { ArrowLeft, Eye, EyeOff, RefreshCw, Trash2, Mail, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

const StaffResultDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const fetchResult = () => {
    getResultApi(id)
      .then(({ data }) => setResult(data.result))
      .catch(() => toast.error('Result not found'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchResult(); }, [id]);

  useSocket('ai:update', ({ resultId, aiStatus, aiExplanation, aiGeneratedAt }) => {
    if (resultId !== id) return;
    setResult((prev) =>
      prev ? { ...prev, aiStatus, aiExplanation: aiExplanation ?? prev.aiExplanation, aiGeneratedAt } : prev
    );
    if (aiStatus === 'done') toast.success('AI summary is ready');
    if (aiStatus === 'failed') toast.error('AI summary generation failed');
  });

  const handleToggleVisibility = async () => {
    try {
      await toggleVisibilityApi(id);
      toast.success(result.isVisible ? 'Hidden from patient' : 'Now visible to patient');
      fetchResult();
    } catch {
      toast.error('Failed to update visibility');
    }
  };

  const handleRegenerate = async () => {
    try {
      await regenerateAiApi(id);
      toast.success('AI regeneration started');
      setResult((prev) => prev ? { ...prev, aiStatus: 'generating' } : prev);
    } catch {
      toast.error('Failed to regenerate');
    }
  };

  const handleSendEmail = async () => {
    setSending(true);
    try {
      const { data } = await sendReportEmailApi(id);
      toast.success(data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send email');
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this result permanently?')) return;
    try {
      await deleteResultApi(id);
      toast.success('Result deleted');
      navigate('/staff/results');
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <PageWrapper
      title="Result Details"
      action={
        <div className="flex items-center gap-1.5">
          <Link to="/staff/results" className="btn-secondary !px-3" title="Back">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </Link>
          {result && (
            <Link to={`/staff/results/${id}/chat`} className="btn-primary !px-3" title="Ask AI">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Ask AI</span>
            </Link>
          )}
          {result && (
            <>
              <button
                onClick={handleToggleVisibility}
                className="btn-secondary !px-3"
                title={result.isVisible ? 'Hide from patient' : 'Show to patient'}
              >
                {result.isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span className="hidden sm:inline">{result.isVisible ? 'Hide' : 'Show'}</span>
              </button>
              <button
                onClick={handleSendEmail}
                disabled={sending}
                className="btn-secondary !px-3"
                title="Email report to patient"
              >
                <Mail className="w-4 h-4" />
                <span className="hidden sm:inline">{sending ? 'Sending…' : 'Email'}</span>
              </button>
              <button
                onClick={handleRegenerate}
                className="btn-secondary !px-3"
                title="Regenerate AI summary"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Regenerate</span>
              </button>
              <button
                onClick={handleDelete}
                className="btn-danger !px-3"
                title="Delete result"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Delete</span>
              </button>
            </>
          )}
        </div>
      }
    >
      {loading && <Spinner fullPage message="Loading result…" />}
      {!loading && result && (
        <>
          {!result.isVisible && (
            <div className="flex items-center gap-2.5 mb-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700 animate-fadeIn">
              <EyeOff className="w-4 h-4 flex-shrink-0" />
              This result is currently <strong>hidden</strong> from the patient.
            </div>
          )}
          <ResultDetail result={result} />
          {result.notes && (
            <div className="card mt-4 border-l-4 border-l-slate-300 animate-fadeIn">
              <h3 className="font-heading font-semibold text-slate-800 mb-2 text-sm">Internal Notes</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{result.notes}</p>
            </div>
          )}
        </>
      )}
    </PageWrapper>
  );
};

export default StaffResultDetailPage;
