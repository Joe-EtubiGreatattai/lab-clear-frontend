import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import {
  FlaskConical, LogOut, Menu, X,
  LayoutDashboard, ClipboardList, Users, PlusCircle, ShieldCheck, FileText, User,
} from 'lucide-react';

const staffLinks = [
  { to: '/staff/dashboard',   label: 'Dashboard',   icon: LayoutDashboard, end: true },
  { to: '/staff/results',     label: 'All Results',  icon: ClipboardList,   end: true },
  { to: '/staff/patients',    label: 'Patients',     icon: Users,           end: false },
  { to: '/staff/results/add', label: 'Add Result',   icon: PlusCircle,      end: true },
];

const patientLinks = [
  { to: '/patient/dashboard', label: 'My Results',  icon: FileText,        end: true },
  { to: '/patient/profile',   label: 'Profile',     icon: User,            end: true },
];

const NavItem = ({ to, label, icon: Icon, end, onClick }) => {
  const { pathname } = useLocation();
  const active = end ? pathname === to : (pathname === to || pathname.startsWith(to + '/'));

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
        ${active
          ? 'bg-primary-50 text-primary-700'
          : 'text-surface-500 hover:bg-surface-100 hover:text-surface-900 border border-transparent'
        }`}
    >
      <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-primary-600' : 'text-surface-400 group-hover:text-surface-600'}`} strokeWidth={2} />
      <span className="truncate">{label}</span>
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-primary-400 rounded-r-full" />
      )}
    </Link>
  );
};

const Logo = () => (
  <div className="flex items-center gap-2.5">
    <div className="w-8 h-8 bg-surface-900 border border-surface-800 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
      <FlaskConical className="w-4 h-4 text-white" strokeWidth={2.5} />
    </div>
    <span className="font-heading font-bold text-lg text-surface-900 tracking-tight">
      Lab<span className="text-primary-600">Clear</span>
    </span>
  </div>
);

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = user?.role === 'lab_staff' ? staffLinks : patientLinks;

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  const SidebarContent = ({ onClose }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5 flex-shrink-0">
        <Link to="/" onClick={onClose}>
          <Logo />
        </Link>
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg text-surface-300 hover:text-surface-50 hover:bg-surface-700 transition-colors">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav section label */}
      <div className="px-4 mb-2">
        <span className="text-[10px] font-bold text-surface-400 uppercase tracking-widest font-mono">
          {user?.role === 'lab_staff' ? 'Medical Staff' : 'Patient Portal'}
        </span>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {links.map((l) => (
          <NavItem key={l.to} {...l} onClick={onClose} />
        ))}
      </nav>

      {/* Bottom: user + logout */}
      <div className="flex-shrink-0 px-3 pb-4 pt-3 border-t border-surface-100">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-surface-50 border border-surface-100/50 mb-2">
          <div className="w-8 h-8 bg-surface-900 border border-surface-800 rounded-lg flex items-center justify-center text-white text-xs font-bold font-heading flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-surface-900 leading-none truncate">{user?.name}</p>
            <p className="text-xs text-surface-500 mt-0.5 capitalize">{user?.role?.replace('_', ' ')}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-surface-500 hover:bg-red-50 hover:text-red-600 border border-transparent transition-all duration-150"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Desktop sidebar (fixed) ── */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 flex-col bg-white border-r border-surface-100 z-40">
        <SidebarContent onClose={null} />
      </aside>

      {/* ── Mobile top bar ── */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-14 z-40 flex items-center justify-between px-4 bg-white/80 backdrop-blur-xl border-b border-surface-100">
        <Link to="/">
          <Logo />
        </Link>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg text-surface-500 hover:text-surface-900 hover:bg-surface-100 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {/* ── Mobile overlay sidebar ── */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 w-72 bg-white border-r border-surface-100 z-50 lg:hidden animate-slideIn flex flex-col">
            <SidebarContent onClose={() => setMobileOpen(false)} />
          </aside>
        </>
      )}
    </>
  );
};

export default Sidebar;
