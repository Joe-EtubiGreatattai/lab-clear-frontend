import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPatientApi, getPatientResultsApi } from '../../api/patient.api';
import { useAuth } from '../../auth/AuthContext';
import PageWrapper from '../../components/common/PageWrapper';
import Badge from '../../components/common/Badge';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import { format } from 'date-fns';
import {
  History,
  User,
  Calendar,
  FlaskConical,
  ChevronRight,
  ArrowLeft,
  Activity,
  PlusCircle,
  Stethoscope,
} from 'lucide-react';
import toast from 'react-hot-toast';

const PatientHistoryPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [patient, setPatient] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [patientRes, resultsRes] = await Promise.all([
        getPatientApi(id),
        getPatientResultsApi(id),
      ]);
      setPatient(patientRes.data.patient);
      setResults(resultsRes.data.results);
    } catch (err) {
      toast.error('Failed to load patient history');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredResults = results; // Removing search logic for now as requested to simplify

  if (loading && !patient) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner message="Loading patient history..." />
      </div>
    );
  }

  if (!patient) {
    return (
      <PageWrapper>
        <EmptyState
          icon={User}
          title="Patient not found"
          description="The patient record you're looking for doesn't exist or has been removed."
          action={
            <Link to="/staff/patients" className="btn-secondary">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Patients
            </Link>
          }
        />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="Medical History"
      subtitle={`Comprehensive record of lab results for ${patient.firstName} ${patient.lastName}`}
    >
      {/* Patient Summary Header */}
      <div className="card mb-8 !p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex items-start md:items-center gap-6">
            <div className="w-20 h-20 bg-primary-50 border border-primary-100 text-primary-600 rounded-[2rem] flex items-center justify-center flex-shrink-0 shadow-sm transition-transform duration-500 hover:scale-105">
              <User className="w-10 h-10" />
            </div>
            <div className="space-y-1.5">
              <h2 className="font-heading text-3xl font-bold text-surface-900 tracking-tighter leading-none">
                {patient.firstName} {patient.lastName}
              </h2>
              <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-sm text-surface-500 font-medium">
                <span className="flex items-center gap-2 bg-surface-50 px-3 py-1 rounded-full border border-surface-100">
                  <span className="text-[9px] uppercase tracking-[0.2em] text-surface-400 font-bold">MRN</span>
                  <span className="font-mono text-primary-600 font-bold tracking-tighter">#{patient.mrn}</span>
                </span>
                {patient.dateOfBirth && (
                  <span className="flex items-center gap-2 py-1 text-xs">
                    <Calendar className="w-3.5 h-3.5 text-primary-500" />
                    <span className="font-bold uppercase tracking-widest text-[9px]">Born {format(new Date(patient.dateOfBirth), 'MMM d, yyyy')}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {user?.role === 'doctor' && (
              <Link
                to={`/staff/patients/${patient._id}/add-diagnosis`}
                className="btn-primary bg-emerald-600 border-emerald-500 hover:bg-emerald-700 hover:border-emerald-600 flex items-center gap-3 py-4 px-8 text-base shadow-glow-emerald"
              >
                <Stethoscope className="w-5 h-5" />
                <span>Register Diagnostic</span>
              </Link>
            )}
            <Link
              to={`/staff/results/add?patient=${patient._id}`}
              className="btn-primary flex items-center gap-3 py-4 px-8 text-base shadow-glow-primary"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Upload Lab Result</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-12">
        {/* Left column: Summary Metrics */}
        <div className="xl:w-80 space-y-8">
          <div className="bg-white rounded-[2.5rem] p-10 border border-surface-100 shadow-card">
            <h3 className="font-heading font-bold text-surface-900 mb-10 flex items-center gap-3 text-xs uppercase tracking-[0.2em]">
              <Activity className="w-5 h-5 text-primary-500" />
              Clinical Summary
            </h3>
            <div className="space-y-4">
              <div className="p-6 bg-surface-50 rounded-[2rem] flex items-center justify-between border border-surface-100">
                <span className="text-[10px] font-bold text-surface-400 uppercase tracking-widest">Lab Archives</span>
                <span className="text-3xl font-bold text-surface-900 font-heading tracking-tighter">{results.length}</span>
              </div>
              <div className="p-6 bg-surface-50 rounded-[2rem] flex items-center justify-between border border-surface-100">
                <span className="text-[10px] font-bold text-surface-400 uppercase tracking-widest">Diagnoses</span>
                <span className="text-3xl font-bold text-surface-900 font-heading tracking-tighter">{patient.diagnosisHistory?.length || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Unified Timeline */}
        <div className="flex-1">
          {(() => {
            const combined = [
              ...results.map(r => ({ ...r, type: 'result', sortDate: new Date(r.collectionDate) })),
              ...(patient.diagnosisHistory || []).map(d => ({ ...d, type: 'diagnosis', sortDate: new Date(d.date) }))
            ].sort((a, b) => b.sortDate - a.sortDate);

            if (combined.length === 0) {
              return (
                <div className="bg-white rounded-[3rem] p-24 border border-surface-100 shadow-card">
                  <EmptyState
                    icon={History}
                    title="Historical Void"
                    description="This patient profile contains no historical clinical observations or laboratory results."
                  />
                </div>
              );
            }

            return (
              <div className="relative">
                <div className="absolute left-8 top-10 bottom-10 w-[2px] bg-surface-100 hidden sm:block" />

                <div className="space-y-12">
                  {combined.map((item, idx) => (
                    <div key={item._id || idx} className="relative group animate-fadeIn" style={{ animationDelay: `${idx * 0.05}s` }}>
                      <div className="absolute left-8 top-10 -ml-[11px] hidden sm:block z-10">
                        <div className={`w-5 h-5 rounded-full border-4 border-white shadow-sm ${
                          item.type === 'diagnosis' ? 'bg-primary-600' :
                          (item.status === 'critical' ? 'bg-red-500' :
                          item.status === 'abnormal' ? 'bg-amber-500' : 'bg-emerald-500')
                        }`} />
                      </div>

                      <div className="sm:pl-20">
                        {item.type === 'diagnosis' ? (
                          <div className="bg-white rounded-[2.5rem] p-10 border-l-8 border-l-primary-600 border border-surface-100 shadow-card hover:shadow-hover transition-all duration-500">
                            <div className="flex flex-col lg:flex-row justify-between gap-6">
                              <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 bg-primary-50 text-primary-600 rounded-xl">
                                    <Stethoscope className="w-5 h-5" />
                                  </div>
                                  <h4 className="font-heading text-3xl font-bold text-surface-900 tracking-tight">
                                    {item.condition}
                                  </h4>
                                </div>
                                {item.notes && (
                                  <p className="text-surface-600 font-medium leading-relaxed max-w-2xl">
                                    {item.notes}
                                  </p>
                                )}
                                <div className="pt-4 flex flex-wrap items-center gap-x-8 gap-y-3">
                                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-surface-400">
                                    <User className="w-3.5 h-3.5 text-primary-500" />
                                    <span>Diagnosed By: <span className="text-surface-900">{item.diagnosedBy?.name || 'Medical Officer'}</span></span>
                                  </div>
                                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-surface-400">
                                    <Calendar className="w-3.5 h-3.5 text-primary-500" />
                                    <span>{format(new Date(item.date), 'MMMM d, yyyy')}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <Link
                            to={`/staff/results/${item._id}`}
                            className="block bg-white rounded-[2.5rem] p-8 border border-surface-100 shadow-card hover:border-primary-400/30 hover:shadow-hover hover:-translate-y-1 transition-all duration-500"
                          >
                            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8">
                              <div className="flex-1 space-y-3">
                                <div className="flex flex-wrap items-center gap-4">
                                  <h4 className="font-heading text-2xl font-bold text-surface-900 group-hover:text-primary-700 transition-colors tracking-tighter">
                                    {item.testName}
                                  </h4>
                                  <Badge status={item.status} className="!px-3 !py-1 !text-[9px]" />
                                </div>
                                <div className="flex flex-wrap items-center gap-x-10 gap-y-2 text-[10px] font-bold uppercase tracking-[0.2em] text-surface-400">
                                  <span className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-primary-500" />
                                    {format(new Date(item.collectionDate), 'MMMM d, yyyy')}
                                  </span>
                                  <span className="flex items-center gap-2">
                                    <FlaskConical className="w-4 h-4" />
                                    Secure Clinical Archive
                                  </span>
                                </div>
                              </div>
                              <div className="w-12 h-12 rounded-full bg-surface-50 border border-surface-100 flex items-center justify-center text-surface-400 group-hover:bg-surface-900 group-hover:text-white group-hover:border-surface-900 transition-all duration-500">
                                <ChevronRight className="w-6 h-6" />
                              </div>
                            </div>
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </PageWrapper>
  );
};

export default PatientHistoryPage;
