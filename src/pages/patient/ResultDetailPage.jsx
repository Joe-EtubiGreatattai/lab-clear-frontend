import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getResultApi } from '../../api/result.api';
import ResultDetail from '../../components/patient/ResultDetail';
import PageWrapper from '../../components/common/PageWrapper';
import { ResultDetailSkeleton } from '../../components/common/Skeleton';
import useSocket from '../../hooks/useSocket';
import { ArrowLeft, Download, MessageCircle } from 'lucide-react';
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
      .catch(() => setError('Result not found'))
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
    toast.error('This result has been hidden by your lab.');
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
      pdf.save(`lab-result-${result?.testName?.replace(/\s+/g, '-') || id}.pdf`);
      toast.success('PDF downloaded');
    } catch {
      toast.error('PDF export failed');
    } finally {
      setExporting(false);
    }
  };

  return (
    <PageWrapper
      title="Result Details"
      action={
        <div className="flex items-center gap-2">
          {result && result.aiStatus === 'done' && (
            <>
              <Link to={`/patient/results/${id}/chat`} className="btn-primary">
                <MessageCircle className="w-4 h-4" /> Ask Questions
              </Link>
              <button
                onClick={handleExportPDF}
                disabled={exporting}
                className="btn-secondary"
              >
                <Download className="w-4 h-4" />
                {exporting ? 'Exporting…' : 'Export PDF'}
              </button>
            </>
          )}
          <Link to="/patient/dashboard" className="btn-secondary">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
        </div>
      }
    >
      {loading && <ResultDetailSkeleton />}
      {!loading && error && (
        <div className="card text-center py-12 text-red-500 text-sm">{error}</div>
      )}
      {!loading && result && (
        <div ref={printRef}>
          <ResultDetail result={result} />
        </div>
      )}
    </PageWrapper>
  );
};

export default ResultDetailPage;
