import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPatientApi, addDiagnosisApi } from '../../api/patient.api';
import PageWrapper from '../../components/common/PageWrapper';
import Spinner from '../../components/common/Spinner';
import { Stethoscope, AlertCircle, Save, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const AddDiagnosisPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [condition, setCondition] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    getPatientApi(id)
      .then(({ data }) => setPatient(data.patient))
      .catch(() => toast.error('Patient record not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!condition.trim()) return toast.error('Condition/Diagnosis is required');
    
    setSaving(true);
    try {
      await addDiagnosisApi(id, { condition, notes, date });
      toast.success('Clinical diagnosis registered successfully');
      navigate(`/staff/patients/${id}/history`);
    } catch (err) {
      toast.error('Failed to register diagnosis');
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageWrapper
      title="Clinical Registry"
      subtitle="Document official diagnosis and clinical findings for medical record"
    >
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-surface-400 hover:text-primary-600 font-bold text-[10px] uppercase tracking-widest mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to History
        </button>

        {loading ? (
          <Spinner message="Synchronizing clinical records..." />
        ) : !patient ? (
          <div className="bg-red-50 border border-red-100 p-8 rounded-[2rem] text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-red-900 mb-2">Record Mismatch</h3>
            <p className="text-red-600">The patient archive could not be verified.</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1fr_350px] gap-12 items-start">
            <form onSubmit={handleSubmit} className="space-y-8 animate-fadeIn">
              <div className="bg-white rounded-[2.5rem] p-10 border border-surface-100 shadow-card">
                <div className="space-y-8">
                  <div>
                    <label className="block text-[10px] font-bold text-surface-400 uppercase tracking-widest mb-3 ml-1">
                      Condition / Diagnosis <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={condition}
                      onChange={(e) => setCondition(e.target.value)}
                      placeholder="e.g., Severe Iron Deficiency Anemia"
                      className="input-field text-lg py-4"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-surface-400 uppercase tracking-widest mb-3 ml-1">
                      Clinical Notes & Observations
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Provide detailed observations for the medical team..."
                      className="input-field min-h-[200px] py-4 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-bold text-surface-400 uppercase tracking-widest mb-3 ml-1">
                        Effective Date
                      </label>
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="input-field py-4"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-12 pt-10 border-t border-surface-50 flex items-center justify-end gap-4">
                  <button 
                    type="button" 
                    onClick={() => navigate(-1)}
                    className="btn-secondary px-8"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={saving}
                    className="btn-primary px-10 flex items-center gap-3 shadow-glow-primary"
                  >
                    {saving ? <Spinner className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                    <span>{saving ? 'Processing...' : 'Register Findings'}</span>
                  </button>
                </div>
              </div>
            </form>

            <aside className="space-y-6">
              <div className="bg-primary-600 rounded-[2.5rem] p-8 text-white shadow-glow-primary animate-fadeIn delay-100">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                  <Stethoscope className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-heading font-bold text-xl mb-4 tracking-tight">Clinical Registry Rules</h4>
                <ul className="space-y-3 text-sm font-medium text-primary-100">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-white mt-2 flex-shrink-0" />
                    Entries are permanent and dated.
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-white mt-2 flex-shrink-0" />
                    Visible to all medical staff.
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-white mt-2 flex-shrink-0" />
                    Directly impacts AI diagnostics.
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-[2.5rem] p-8 border border-surface-100 shadow-card animate-fadeIn delay-200">
                <h4 className="text-[10px] font-bold text-surface-400 uppercase tracking-widest mb-6">Patient Context</h4>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-surface-50 flex items-center justify-center text-primary-600 font-bold border border-surface-100">
                    {patient.firstName[0]}{patient.lastName[0]}
                  </div>
                  <div>
                    <p className="font-bold text-surface-900 leading-tight">{patient.firstName} {patient.lastName}</p>
                    <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest">MRN: #{patient.mrn}</p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default AddDiagnosisPage;
