import { useState, useEffect } from 'react';
import { getPatientsApi, deletePatientApi } from '../../api/patient.api';
import PageWrapper from '../../components/common/PageWrapper';
import PatientForm from '../../components/staff/PatientForm';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import { Link } from 'react-router-dom';
import { PlusCircle, Edit2, Trash2, Search, FlaskConical, Users, CheckCircle, XCircle, History, X } from 'lucide-react';
import toast from 'react-hot-toast';

const avatarColor = (str = '') => {
  const colors = [
    'bg-primary-50 text-primary-700 border-primary-100',
    'bg-blue-50 text-blue-700 border-blue-100',
    'bg-violet-50 text-violet-700 border-violet-100',
    'bg-amber-50 text-amber-700 border-amber-100',
    'bg-rose-50 text-rose-700 border-rose-100',
  ];
  let hash = 0;
  for (const c of str) hash = c.charCodeAt(0) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

const ManagePatientsPage = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);

  const fetchPatients = async (q = '') => {
    setLoading(true);
    try {
      const { data } = await getPatientsApi(q);
      setPatients(data.patients);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPatients(); }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchPatients(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const handleDelete = async (id, name) => {
    if (!confirm(`Deactivate ${name}?`)) return;
    try {
      await deletePatientApi(id);
      toast.success('Patient deactivated');
      fetchPatients(search);
    } catch {
      toast.error('Failed to deactivate patient');
    }
  };


  return (
    <PageWrapper
      title="Clinical Directory"
      subtitle="Comprehensive patient records and portal access management."
      action={
        <button
          onClick={() => { setShowForm(true); }}
          className="btn-primary"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Patient</span>
        </button>
      }
    >
      {/* Inline form */}
      {showForm && (
        <div className="bg-white rounded-[2.5rem] border border-primary-100 p-10 mb-12 animate-fadeIn shadow-glow">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-heading font-bold text-3xl tracking-tighter text-surface-900">
                New Registration
              </h3>
              <p className="text-sm font-medium text-surface-600 mt-1 uppercase tracking-widest">Electronic Health Record</p>
            </div>
            <button onClick={() => { setShowForm(false); }} className="p-2 rounded-full hover:bg-surface-100 transition-colors">
              <X className="w-5 h-5 text-surface-400" />
            </button>
          </div>
          <PatientForm
            onSuccess={() => { setShowForm(false); fetchPatients(search); }}
            onCancel={() => { setShowForm(false); }}
          />
        </div>
      )}

      <div className="space-y-8">
        {/* Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="relative group flex-1">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400 group-focus-within:text-primary-500 transition-colors" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, MRN, or identity code..."
              className="w-full bg-white border border-surface-200 rounded-full pl-14 pr-6 py-4 text-sm focus:border-primary-400 focus:shadow-input transition-all"
            />
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-surface-100 rounded-full border border-surface-200">
            <Users className="w-4 h-4 text-surface-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-surface-600">{patients.length} Records</span>
          </div>
        </div>

        {loading && (
          <div className="py-20 flex flex-col items-center justify-center space-y-4">
            <Spinner />
            <p className="text-xs font-bold uppercase tracking-widest text-surface-400">Syncing Population Data</p>
          </div>
        )}

        {!loading && patients.length === 0 && (
          <div className="bg-white rounded-[3rem] p-24 shadow-card border border-surface-100 text-center">
            <EmptyState
              icon={Users}
              title="No Patients Identified"
              description={search ? `No records found matching "${search}".` : 'The directory is currently empty. Initialize a new registration.'}
            />
          </div>
        )}

        {!loading && patients.length > 0 && (
          <div className="bg-white rounded-[3rem] shadow-card border border-surface-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-surface-100 bg-surface-50/50">
                    <th className="text-left py-6 px-10 text-[11px] font-bold text-surface-500 uppercase tracking-[0.2em]">Patient Profile</th>
                    <th className="text-left py-6 px-4 text-[11px] font-bold text-surface-500 uppercase tracking-[0.2em]">Identity Code</th>
                    <th className="text-left py-6 px-4 text-[11px] font-bold text-surface-500 uppercase tracking-[0.2em] hidden md:table-cell">Contact Metrics</th>
                    <th className="text-left py-6 px-4 text-[11px] font-bold text-surface-500 uppercase tracking-[0.2em] hidden lg:table-cell">Portal Access</th>
                    <th className="text-right py-6 px-10 text-[11px] font-bold text-surface-500 uppercase tracking-[0.2em]">Operations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-50">
                  {patients.map((p, i) => {
                    const initials = `${p.firstName[0]}${p.lastName[0]}`.toUpperCase();
                    return (
                      <tr
                        key={p._id}
                        className="group hover:bg-surface-50 transition-colors animate-fadeIn"
                        style={{ animationDelay: `${i * 0.04}s` }}
                      >
                        <td className="py-6 px-8">
                          <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-2xl bg-surface-100 border border-surface-200 flex items-center justify-center text-xs font-bold font-heading text-surface-600 group-hover:bg-primary-400 group-hover:text-primary-900 group-hover:border-primary-400 transition-all duration-500">
                              {initials}
                            </div>
                            <div>
                              <p className="text-[17px] font-bold text-surface-900 tracking-tight leading-tight group-hover:text-primary-700 transition-colors">
                                {p.firstName} {p.lastName}
                              </p>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-surface-600 mt-1">Full Clinical Record</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-6 px-4">
                          <span className="font-mono text-xs font-bold px-3 py-1 bg-surface-100 text-surface-600 rounded-lg group-hover:bg-primary-50 group-hover:text-primary-700 transition-colors">
                            {p.mrn}
                          </span>
                        </td>
                        <td className="py-6 px-4 hidden md:table-cell">
                          <div className="space-y-1">
                            <p className="text-sm font-semibold text-surface-700 leading-none">{p.email || '—'}</p>
                            <p className="text-xs font-medium text-surface-400">{p.phone || 'No Phone'}</p>
                          </div>
                        </td>
                        <td className="py-6 px-4 hidden lg:table-cell">
                          {p.userId ? (
                            <div className="flex items-center gap-2 text-emerald-600">
                              <CheckCircle className="w-4 h-4" />
                              <span className="text-[10px] font-bold uppercase tracking-widest">Active Portal</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-surface-300">
                              <XCircle className="w-4 h-4" />
                              <span className="text-[10px] font-bold uppercase tracking-widest">Unlinked</span>
                            </div>
                          )}
                        </td>
                        <td className="py-6 px-8 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              to={`/staff/results/add?patient=${p._id}`}
                              className="w-10 h-10 rounded-full border border-surface-100 flex items-center justify-center text-surface-400 hover:bg-primary-400 hover:text-primary-900 hover:border-primary-400 transition-all duration-500"
                              title="Add Diagnostic"
                            >
                              <FlaskConical className="w-4 h-4" strokeWidth={2.5} />
                            </Link>
                            <Link
                              to={`/staff/patients/${p._id}/history`}
                              className="w-10 h-10 rounded-full border border-surface-100 flex items-center justify-center text-surface-400 hover:bg-surface-900 hover:text-white transition-all duration-500"
                              title="View Archive"
                            >
                              <History className="w-4 h-4" strokeWidth={2.5} />
                            </Link>
                            <button
                              onClick={() => handleDelete(p._id, `${p.firstName} ${p.lastName}`)}
                              className="w-10 h-10 rounded-full border border-surface-100 flex items-center justify-center text-surface-400 hover:bg-red-500 hover:text-white transition-all duration-500"
                            >
                              <Trash2 className="w-4 h-4" strokeWidth={2.5} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default ManagePatientsPage;
