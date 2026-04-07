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
      <div className="flex items-center justify-center h-[calc(100vh-3.5rem)] lg:h-screen">
        <Spinner size="md" message="Loading result…" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 h-[calc(100vh-3.5rem)] lg:h-screen">
        <p className="text-sm text-red-400">{error}</p>
        <Link to="/staff/results" className="btn-secondary">
          <ArrowLeft className="w-4 h-4" /> Back to Results
        </Link>
      </div>
    );
  }

  return <StaffResultChat result={result} />;
};

export default StaffResultChatPage;
