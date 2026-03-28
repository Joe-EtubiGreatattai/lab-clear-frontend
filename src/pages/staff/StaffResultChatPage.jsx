import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getResultApi } from '../../api/result.api';
import StaffResultChat from '../../components/staff/StaffResultChat';
import Spinner from '../../components/common/Spinner';
import { ArrowLeft } from 'lucide-react';

const StaffResultChatPage = () => {
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getResultApi(id)
      .then(({ data }) => setResult(data.result))
      .catch(() => setError('Result not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height: 'calc(100vh - 64px)' }}>
        <Spinner size="md" message="Loading result…" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4" style={{ height: 'calc(100vh - 64px)' }}>
        <p className="text-sm text-red-500">{error}</p>
        <Link to="/staff/results" className="btn-secondary">
          <ArrowLeft className="w-4 h-4" /> Back to Results
        </Link>
      </div>
    );
  }

  return <StaffResultChat result={result} />;
};

export default StaffResultChatPage;
