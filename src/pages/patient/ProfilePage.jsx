import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { getPatientApi } from '../../api/patient.api';
import PageWrapper from '../../components/common/PageWrapper';
import PatientForm from '../../components/staff/PatientForm';
import Spinner from '../../components/common/Spinner';
import { User, ShieldCheck, Mail, Phone, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user } = useAuth();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!user?.patientProfile) return;
    setLoading(true);
    try {
      const { data } = await getPatientApi(user.patientProfile);
      setPatient(data.patient);
    } catch (err) {
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  }, [user?.patientProfile]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (loading) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Spinner message="Synchronizing secure profile…" />
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="Profile Settings"
      subtitle="Manage your clinical identity and communication preferences."
    >
      <div className="flex flex-col xl:flex-row gap-12">
        {/* Left: Summary Card */}
        <div className="xl:w-[400px] space-y-8">
          <div className="bg-white rounded-[2.5rem] p-10 border border-surface-100 shadow-card text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-primary-400" />
            <div className="w-24 h-24 bg-primary-50 border border-primary-100 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 shadow-sm">
              <User className="w-12 h-12 text-primary-600" />
            </div>
            <h3 className="font-heading font-bold text-2xl tracking-tighter text-surface-900 leading-tight">
              {patient?.firstName} {patient?.lastName}
            </h3>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-surface-400 mt-2">Verified Patient Account</p>
            
            <div className="mt-10 space-y-4 text-left">
              <div className="flex items-center gap-3 text-surface-500">
                <ShieldCheck className="w-4 h-4 text-primary-500" />
                <span className="text-xs font-bold font-mono tracking-tighter">#{patient?.mrn}</span>
              </div>
              <div className="flex items-center gap-3 text-surface-500">
                <Mail className="w-4 h-4 text-primary-500" />
                <span className="text-xs font-semibold truncate">{patient?.email || user.email}</span>
              </div>
              {patient?.phone && (
                <div className="flex items-center gap-3 text-surface-500">
                  <Phone className="w-4 h-4 text-primary-500" />
                  <span className="text-xs font-semibold">{patient.phone}</span>
                </div>
              )}
              {patient?.dateOfBirth && (
                <div className="flex items-center gap-3 text-surface-500">
                  <Calendar className="w-4 h-4 text-primary-500" />
                  <span className="text-xs font-semibold">
                    {format(new Date(patient.dateOfBirth), 'MMMM d, yyyy')}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-primary-900 p-8 rounded-[2.5rem] shadow-card text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-400/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-primary-400/20 transition-all duration-700" />
            <h4 className="font-heading font-bold text-lg tracking-tight mb-2">Patient Security</h4>
            <p className="text-xs text-primary-100/70 leading-relaxed mb-6">
              Your data is encrypted using end-to-end clinical grade protocols.
            </p>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary-400 bg-primary-800/50 px-3 py-1.5 rounded-full border border-primary-700/50 w-fit">
              <ShieldCheck className="w-3.5 h-3.5" />
              AES-256 Verified
            </div>
          </div>
        </div>

        {/* Right: Form */}
        <div className="flex-1">
          <div className="bg-white rounded-[3rem] p-10 md:p-14 border border-surface-100 shadow-card">
            <div className="mb-10">
              <h3 className="font-heading font-bold text-3xl tracking-tighter text-surface-900 leading-tight">
                Personal Information
              </h3>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-surface-400 mt-2">
                Clinical Identity Registration Update
              </p>
            </div>
            
            <PatientForm
              patient={patient}
              onSuccess={() => {
                fetchProfile();
                toast.success('Clinical profile updated successfully');
              }}
            />
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default ProfilePage;
