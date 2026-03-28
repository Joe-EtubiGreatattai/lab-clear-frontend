import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getPatientsApi } from '../../api/patient.api';
import PageWrapper from '../../components/common/PageWrapper';
import StatCard from '../../components/common/StatCard';
import EmptyState from '../../components/common/EmptyState';
import Spinner from '../../components/common/Spinner';
import { useAuth } from '../../auth/AuthContext';
import { Users, FlaskConical, PlusCircle, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

// Generate a deterministic color from a string (for patient initials avatar)
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

const StaffDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPatientsApi()
      .then(({ data }) => setPatients(data.patients))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const firstName = user?.name?.split(' ')[0] || 'there';
  const today = format(new Date(), 'EEEE, MMMM d');

  return (
    <PageWrapper>
      {loading && <Spinner fullPage />}

      {!loading && (
        <>
          {/* Header */}
          <div className="mb-8 animate-fadeIn">
            <p className="text-sm text-slate-400 font-medium">{today}</p>
            <h1 className="font-heading font-bold text-2xl sm:text-3xl text-slate-900 mt-1">
              Welcome back, {firstName}
            </h1>
            <p className="text-sm text-slate-500 mt-1">Here's what's going on in your lab today.</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <StatCard
              icon={Users}
              label="Total Patients"
              value={patients.length}
              color="teal"
            />
            <StatCard
              icon={FlaskConical}
              label="Add Lab Result"
              value="New"
              color="blue"
              onClick={() => navigate('/staff/results/add')}
            />
            <StatCard
              icon={PlusCircle}
              label="Manage Patients"
              value="View all"
              color="slate"
              onClick={() => navigate('/staff/patients')}
            />
          </div>

          {/* Recent patients */}
          <div className="card animate-fadeIn">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-heading font-bold text-slate-900">Recent Patients</h2>
              <Link
                to="/staff/patients"
                className="text-xs text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-1"
              >
                View all <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {patients.length === 0 && (
              <EmptyState
                icon={Users}
                title="No patients yet"
                description="Add your first patient to get started."
                action={{ label: 'Add Patient', onClick: () => navigate('/staff/patients') }}
              />
            )}

            {patients.length > 0 && (
              <div className="divide-y divide-slate-50">
                {patients.slice(0, 6).map((p, i) => {
                  const initials = `${p.firstName[0]}${p.lastName[0]}`.toUpperCase();
                  const color = avatarColor(p.mrn);
                  return (
                    <div
                      key={p._id}
                      className="flex items-center justify-between py-3 animate-fadeIn"
                      style={{ animationDelay: `${i * 0.05}s` }}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 ${color}`}>
                          {initials}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {p.firstName} {p.lastName}
                          </p>
                          <p className="text-xs text-slate-400 font-mono">{p.mrn}</p>
                        </div>
                      </div>
                      <Link
                        to={`/staff/results/add?patient=${p._id}`}
                        className="text-xs text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-primary-50 transition-colors"
                      >
                        <FlaskConical className="w-3.5 h-3.5" /> Add Result
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </PageWrapper>
  );
};

export default StaffDashboard;
