import PageWrapper from '../../components/common/PageWrapper';
import ResultForm from '../../components/staff/ResultForm';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const AddResultPage = () => {
  const [searchParams] = useSearchParams();
  const preselectedPatientId = searchParams.get('patient');

  return (
    <PageWrapper
      title="Add Lab Result"
      subtitle="Enter patient results. An AI plain-English summary will be generated automatically."
      action={
        <Link to="/staff/results" className="btn-secondary">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
      }
    >
      <ResultForm preselectedPatientId={preselectedPatientId} />
    </PageWrapper>
  );
};

export default AddResultPage;
