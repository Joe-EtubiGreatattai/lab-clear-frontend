import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getPatientsApi } from '../../api/patient.api';
import PageWrapper from '../../components/common/PageWrapper';
import EmptyState from '../../components/common/EmptyState';
import Spinner from '../../components/common/Spinner';
import { useAuth } from '../../auth/AuthContext';
import {
  Users, FlaskConical, PlusCircle, ChevronRight,
  ArrowUpRight, Activity, CheckCircle2
} from 'lucide-react';
import { format } from 'date-fns';

const avatarColor = (str = '') => {
  const colors = [
    'bg-primary-400/15 text-primary-400',
    'bg-blue-400/15 text-blue-400',
    'bg-violet-400/15 text-violet-400',
    'bg-amber-400/15 text-amber-400',
    'bg-rose-400/15 text-rose-400',
  ];
  let hash = 0;
  for (const c of str) hash = c.charCodeAt(0) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

const QuickActionCard = ({ icon: Icon, label, description, onClick, to, color = 'primary' }) => {
  const colorMap = {
    primary: 'bg-primary-50 border-primary-200 text-primary-700 hover:bg-primary-100/50 hover:border-primary-400/50 hover:shadow-card',
    blue:    'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100/50 hover:border-blue-400/50',
    slate:   'bg-surface-50 border-surface-200 text-surface-600 hover:bg-white hover:border-surface-400 hover:shadow-card',
  };
  const Tag = to ? Link : 'button';
  return (
    <Tag
      to={to}
      onClick={onClick}
      className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 cursor-pointer w-full text-left ${colorMap[color]}`}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-current/10`}>
        <Icon className="w-5 h-5" strokeWidth={1.8} />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-bold text-surface-900 leading-none tracking-tight">{label}</p>
        <p className="text-[11px] text-surface-600 mt-1 leading-tight font-medium">{description}</p>
      </div>
      <ArrowUpRight className="w-4 h-4 text-surface-400 flex-shrink-0 ml-auto" />
    </Tag>
  );
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

  const firstName = user?.name?.split(' ')[0] || 'Member';
  const today = format(new Date(), 'MMMM d, yyyy');
  const greeting = new Date().getHours() < 12 ? 'Good Morning' : 'Good Afternoon';

  return (
    <PageWrapper 
      title={<span>{greeting}, <span className="text-primary-600">{firstName}</span></span>}
      subtitle={`It's ${today}. You have ${patients.length} patients registered in the clinical system.`}
      action={
        <Link to="/staff/results/add" className="btn-primary">
          <PlusCircle className="w-4 h-4" />
          Register Result
        </Link>
      }
    >
      {loading && <Spinner fullPage />}

      {!loading && (
        <div className="space-y-12">
          {/* ── Stats Section ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                label: user?.role === 'doctor' ? 'My Patients' : 'Global Patients',
                value: patients.length,
                icon: Users,
                color: 'text-surface-900',
                border: 'border-surface-200',
              },
              {
                label: 'Verified Accounts',
                value: patients.filter(p => p.userId).length,
                icon: CheckCircle2,
                color: 'text-primary-600',
                border: 'border-primary-100',
              },
              {
                label: 'Pending Linkage',
                value: patients.filter(p => !p.userId).length,
                icon: Activity,
                color: 'text-amber-600',
                border: 'border-amber-100',
              },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className={`group bg-white p-8 rounded-[2rem] border-b-4 ${stat.border} shadow-card hover:shadow-hover transition-all duration-500`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-surface-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                    <stat.icon className={`w-6 h-6 ${stat.color}`} strokeWidth={2.5} />
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-surface-300 group-hover:text-primary-400 transition-colors" />
                </div>
                <p className="text-5xl font-heading font-bold text-surface-900 tracking-tighter mb-1">{stat.value}</p>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-surface-600">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* ── Main Content ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* List Column */}
            <div className="lg:col-span-8 space-y-8">
              <div className="flex items-end justify-between px-2">
                <div>
                  <h2 className="font-heading font-bold text-3xl tracking-tighter text-surface-900 mb-1">Clinical Directory</h2>
                  <p className="text-sm font-medium text-surface-600 uppercase tracking-widest">Recent Activity</p>
                </div>
                <Link to="/staff/patients" className="text-sm font-bold text-primary-600 hover:underline underline-offset-8">
                  Directory Archive →
                </Link>
              </div>

              <div className="bg-white rounded-[2.5rem] shadow-card border border-surface-100 p-2 overflow-hidden">
                {patients.length === 0 ? (
                  <div className="p-12">
                    <EmptyState
                      icon={Users}
                      title="No records found"
                      description="The clinical database is currently empty."
                      action={
                        <button onClick={() => navigate('/staff/patients')} className="btn-primary mt-6">
                          Add Patient
                        </button>
                      }
                    />
                  </div>
                ) : (
                  <div className="divide-y divide-surface-100">
                    {patients.slice(0, 8).map((p) => {
                      const initials = `${p.firstName[0]}${p.lastName[0]}`.toUpperCase();
                      return (
                        <div key={p._id} className="flex items-center justify-between p-6 hover:bg-surface-50 transition-colors group">
                          <div className="flex items-center gap-5">
                            <div className="w-14 h-14 rounded-2xl bg-surface-100 border border-surface-200 flex items-center justify-center text-sm font-bold font-heading text-surface-600 group-hover:bg-primary-400 group-hover:text-primary-900 group-hover:border-primary-400 transition-all duration-500">
                              {initials}
                            </div>
                            <div>
                              <p className="text-lg font-bold text-surface-900 tracking-tight leading-tight group-hover:text-primary-700 transition-colors">
                                {p.firstName} {p.lastName}
                              </p>
                              <div className="flex items-center gap-3 mt-1.5">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-surface-600 px-2 py-0.5 bg-surface-100 rounded-md">ID: {p.mrn}</span>
                                {p.userId && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <Link
                              to={`/staff/patients/${p._id}/history`}
                              className="text-xs font-bold uppercase tracking-widest text-surface-400 hover:text-surface-900 transition-colors"
                            >
                              Details
                            </Link>
                            <Link
                              to={`/staff/results/add?patient=${p._id}`}
                              className="w-10 h-10 rounded-full border border-surface-200 flex items-center justify-center text-surface-400 hover:bg-primary-400 hover:text-primary-900 hover:border-primary-400 transition-all duration-500"
                            >
                              <PlusCircle className="w-5 h-5" />
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar Column */}
            <div className="lg:col-span-4 space-y-10">
              <section>
                <h3 className="font-heading font-bold text-xl tracking-tight text-surface-900 mb-6">Operations</h3>
                <div className="grid grid-cols-1 gap-4">
                  <QuickActionCard
                    to="/staff/results/add"
                    icon={FlaskConical}
                    label="Register Result"
                    description="Upload new laboratory data."
                    color="primary"
                  />
                  <QuickActionCard
                    to="/staff/patients"
                    icon={Users}
                    label="Registry"
                    description="Manage patient population."
                    color="slate"
                  />
                  <QuickActionCard
                    to="/staff/results"
                    icon={Activity}
                    label="Analytics View"
                    description="Browse historical records."
                    color="slate"
                  />
                </div>
              </section>

            </div>

          </div>
        </div>
      )}
    </PageWrapper>
  );
};

export default StaffDashboard;
