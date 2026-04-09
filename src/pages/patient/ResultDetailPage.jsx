import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getResultApi } from '../../api/result.api';
import ResultDetail from '../../components/patient/ResultDetail';
import PageWrapper from '../../components/common/PageWrapper';
import { ResultDetailSkeleton } from '../../components/common/Skeleton';
import useSocket from '../../hooks/useSocket';
import { ArrowLeft, Download, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const ResultDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);
  const printRef = useRef(null);

  useEffect(() => {
    getResultApi(id)
      .then(({ data }) => setResult(data.result))
      .catch(() => setError('Diagnostic record not located'))
      .finally(() => setLoading(false));
  }, [id]);

  useSocket('ai:update', ({ resultId, aiStatus, aiExplanation, aiGeneratedAt }) => {
    if (resultId !== id) return;
    setResult((prev) =>
      prev ? { ...prev, aiStatus, aiExplanation: aiExplanation ?? prev.aiExplanation, aiGeneratedAt } : prev
    );
  });

  useSocket('result:visibility', ({ resultId, isVisible }) => {
    if (resultId !== id || isVisible) return;
    toast.error('This result has been archived by your clinical provider.');
    navigate('/patient/dashboard');
  });

  const handleExportPDF = async () => {
    if (!printRef.current) return;
    setExporting(true);
    try {
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import('jspdf'),
        import('html2canvas'),
      ]);
      const canvas = await html2canvas(printRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const ratio = canvas.width / canvas.height;
      const imgH = pageW / ratio;
      let posY = 0;
      let remaining = imgH;
      while (remaining > 0) {
        pdf.addImage(imgData, 'PNG', 0, posY, pageW, imgH);
        remaining -= pageH;
        posY -= pageH;
        if (remaining > 0) pdf.addPage();
      }
      pdf.save(`medical-report-${result?.testName?.replace(/\s+/g, '-') || id}.pdf`);
      toast.success('Clinical report exported');
    } catch {
      toast.error('Export synchronization failed');
    } finally {
      setExporting(false);
    }
  };

  return (
    <PageWrapper
      maxWidth="5xl"
      title={result?.testName || 'Loading Report...'}
      subtitle={result ? `Collected on ${format(new Date(result.collectionDate), 'MMMM d, yyyy')}` : 'Analyzing clinical data...'}
      action={
        <div className="flex items-center gap-3">
          <Link to="/patient/dashboard" className="w-10 h-10 rounded-full border border-surface-200 flex items-center justify-center text-surface-400 hover:bg-surface-100 transition-all">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          {result && result.aiStatus === 'done' && (
            <>
              <button
                onClick={handleExportPDF}
                disabled={exporting}
                className="btn-secondary !rounded-full !px-5"
              >
                <Download className="w-4 h-4" />
                <span>{exporting ? 'Exporting…' : 'Export'}</span>
              </button>
              <Link to={`/patient/results/${id}/chat`} className="btn-primary !rounded-full !px-5">
                <MessageCircle className="w-4 h-4" />
                <span>Intelligence Chat</span>
              </Link>
            </>
          )}
        </div>
      }
    >
      {loading && <ResultDetailSkeleton />}
      {!loading && error && (
        <div className="bg-white rounded-[3rem] p-24 shadow-card border border-surface-100 text-center">
          <h4 className="font-heading font-bold text-2xl text-surface-900 mb-2">Record Offset</h4>
          <p className="text-surface-500 max-w-sm mx-auto">{error}</p>
        </div>
      )}
      {!loading && result && (
        <div ref={printRef} className="animate-fadeIn">
          <ResultDetail result={result} />
        </div>
      )}
    </PageWrapper>
  );
};

export default ResultDetailPage;
