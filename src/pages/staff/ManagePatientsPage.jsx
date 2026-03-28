import { useState, useEffect } from 'react';
import { getPatientsApi, deletePatientApi } from '../../api/patient.api';
import PageWrapper from '../../components/common/PageWrapper';
import PatientForm from '../../components/staff/PatientForm';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import { Link } from 'react-router-dom';
import { PlusCircle, Edit2, Trash2, Search, FlaskConical, Users, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const avatarColor = (str = '') => {
  const colors = [
    'bg-primary-100 text-primary-700',
    'bg-blue-100 text-blue-700',
    'bg-violet-100 text-violet-700',
    'bg-amber-100 text-amber-700',
    'bg-rose-100 text-rose-700',
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
  const [editing, setEditing] = useState(null);

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

  const openEdit = (p) => {
    setEditing(p);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <PageWrapper
      title="Patients"
      subtitle="Manage patient records and portal access"
      action={
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="btn-primary"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Patient</span>
        </button>
      }
    >
      {/* Inline form */}
      {showForm && (
        <div className="card mb-5 animate-fadeIn">
          <h3 className="font-heading font-bold text-slate-900 mb-5">
            {editing ? 'Edit Patient' : 'New Patient'}
          </h3>
          <PatientForm
            patient={editing}
            onSuccess={() => { setShowForm(false); setEditing(null); fetchPatients(search); }}
            onCancel={() => { setShowForm(false); setEditing(null); }}
          />
        </div>
      )}

      <div className="card">
        {/* Search */}
        <div className="relative mb-5">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, MRN, or email…"
            className="input-field pl-10"
          />
        </div>

        {loading && (
          <div className="py-8 flex justify-center">
            <Spinner message="Loading patients…" />
          </div>
        )}

        {!loading && patients.length === 0 && (
          <EmptyState
            icon={Users}
            title="No patients found"
            description={search ? `No patients match "${search}".` : 'Add your first patient to get started.'}
          />
        )}

        {!loading && patients.length > 0 && (
          <>
            {/* Mobile card list */}
            <div className="sm:hidden space-y-3">
              {patients.map((p, i) => {
                const initials = `${p.firstName[0]}${p.lastName[0]}`.toUpperCase();
                const color = avatarColor(p.mrn);
                return (
                  <div
                    key={p._id}
                    className="flex items-center gap-3 py-3 border-b border-slate-50 last:border-0 animate-fadeIn"
                    style={{ animationDelay: `${i * 0.04}s` }}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 ${color}`}>
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 text-sm">
                        {p.firstName} {p.lastName}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{p.mrn}</span>
                        {p.userId
                          ? <span className="text-xs text-green-600 flex items-center gap-0.5"><CheckCircle className="w-3 h-3" /> Linked</span>
                          : <span className="text-xs text-slate-400 flex items-center gap-0.5"><XCircle className="w-3 h-3" /> No portal</span>
                        }
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Link
                        to={`/staff/results/add?patient=${p._id}`}
                        className="p-2 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                        title="Add result"
                      >
                        <FlaskConical className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => openEdit(p)}
                        className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p._id, `${p.firstName} ${p.lastName}`)}
                        className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Deactivate"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto -mx-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-y border-slate-100 bg-slate-50/60">
                    <th className="text-left py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wide">Patient</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">MRN</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Contact</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Portal</th>
                    <th className="text-right py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((p, i) => {
                    const initials = `${p.firstName[0]}${p.lastName[0]}`.toUpperCase();
                    const color = avatarColor(p.mrn);
                    return (
                      <tr
                        key={p._id}
                        className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors animate-fadeIn"
                        style={{ animationDelay: `${i * 0.04}s` }}
                      >
                        <td className="py-3.5 px-6">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${color}`}>
                              {initials}
                            </div>
                            <span className="font-semibold text-slate-800">
                              {p.firstName} {p.lastName}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-lg">{p.mrn}</span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 text-xs hidden md:table-cell">
                          <div>{p.email || '—'}</div>
                          <div className="text-slate-400">{p.phone || ''}</div>
                        </td>
                        <td className="py-3.5 px-4 hidden lg:table-cell">
                          {p.userId ? (
                            <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full font-medium">
                              <CheckCircle className="w-3 h-3" /> Linked
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                              <XCircle className="w-3 h-3" /> Not linked
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-6 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Link
                              to={`/staff/results/add?patient=${p._id}`}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                              title="Add result"
                            >
                              <FlaskConical className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => openEdit(p)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(p._id, `${p.firstName} ${p.lastName}`)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Deactivate"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <p className="text-xs text-slate-400 px-6 pt-3 pb-1">
                {patients.length} patient{patients.length !== 1 ? 's' : ''} total
              </p>
            </div>
          </>
        )}
      </div>
    </PageWrapper>
  );
};

export default ManagePatientsPage;
