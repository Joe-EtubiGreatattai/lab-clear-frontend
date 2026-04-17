import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { FlaskConical, LogOut, Menu, X, ChevronDown } from 'lucide-react';

const NavLink = ({ to, end = false, children, onClick }) => {
  const { pathname } = useLocation();
  const active = end ? pathname === to : (pathname === to || pathname.startsWith(to + '/'));
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`relative text-sm font-medium px-1 py-0.5 transition-all duration-150
        ${active
          ? 'text-primary-400'
          : 'text-surface-100 hover:text-surface-50'
        }`}
    >
      {children}
      {active && (
        <span className="absolute -bottom-[1px] left-0 right-0 h-0.5 bg-primary-400 rounded-full shadow-glow" />
      )}
    </Link>
  );
};

const staffLinks = [
  { to: '/staff/dashboard',    label: 'Dashboard' },
  { to: '/staff/results',      label: 'All Results', end: true },
  { to: '/staff/patients',     label: 'Patients' },
  { to: '/staff/results/add',  label: 'Add Result' },
];

const patientLinks = [
  { to: '/patient/dashboard', label: 'My Results' },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const links = ['lab_staff', 'doctor'].includes(user?.role) ? staffLinks : patientLinks;

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    setUserMenuOpen(false);
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  return (
    <>
      <nav className="glass-dark sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between h-20">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 flex-shrink-0 group">
              <div className="w-10 h-10 bg-primary-400/10 border border-primary-400/20 rounded-xl flex items-center justify-center group-hover:shadow-glow transition-all duration-500">
                <FlaskConical className="w-5 h-5 text-primary-400" strokeWidth={2.5} />
              </div>
              <span className="font-heading font-bold text-xl text-surface-50 tracking-tighter">Lab<span className="text-primary-400">Care</span></span>
            </Link>

            {/* Desktop nav links */}
            {user && (
              <div className="hidden md:flex items-center gap-6 h-full">
                {links.map((l) => (
                  <NavLink key={l.to} to={l.to} end={l.end}>{l.label}</NavLink>
                ))}
              </div>
            )}

            {/* Right side */}
            <div className="flex items-center gap-3">
              {user && (
                <>
                  {/* User menu */}
                  <div className="relative hidden md:block">
                    <button
                      onClick={() => setUserMenuOpen((v) => !v)}
                      className="flex items-center gap-3 px-2 py-2 rounded-2xl border border-transparent hover:border-white/5 hover:bg-white/5 transition-all duration-300"
                    >
                      <div className="relative">
                        <div className="w-9 h-9 bg-primary-400/10 border border-primary-400/20 rounded-xl flex items-center justify-center text-primary-400 text-xs font-bold font-heading flex-shrink-0">
                          {initials}
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-surface-900 rounded-full" />
                      </div>
                      <div className="text-left hidden lg:block">
                        <p className="text-sm font-bold text-surface-50 leading-none">{user.name}</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-primary-400/70 mt-1.5">{user.role.replace('_', ' ')}</p>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-surface-400 transition-transform duration-500 ${userMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {userMenuOpen && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                        <div className="absolute right-0 mt-2 w-52 bg-surface-700 rounded-xl shadow-modal border border-surface-600 py-1.5 z-20 animate-fadeIn">
                          <div className="px-3 py-2.5 border-b border-surface-600 mb-1">
                            <p className="text-xs font-semibold text-surface-50">{user.name}</p>
                            <p className="text-xs text-surface-200 mt-0.5">{user.email}</p>
                          </div>
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                          >
                            <LogOut className="w-4 h-4" /> Sign out
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Mobile hamburger */}
                  <button
                    className="md:hidden p-2 rounded-lg text-surface-200 hover:text-surface-50 hover:bg-surface-700 transition-colors"
                    onClick={() => setMobileOpen((v) => !v)}
                  >
                    {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                  </button>
                </>
              )}

              {!user && (
                <Link to="/login" className="btn-primary text-xs px-3 py-2">Sign In</Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && user && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed top-0 right-0 h-full w-72 bg-surface-800 z-50 shadow-modal border-l border-surface-600 flex flex-col animate-slideIn md:hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-surface-600">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-primary-400/10 border border-primary-400/30 rounded-lg flex items-center justify-center">
                  <FlaskConical className="w-4 h-4 text-primary-400" />
                </div>
                <span className="font-heading font-bold text-surface-50">Lab<span className="text-primary-400">Clear</span></span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg hover:bg-surface-700 transition-colors">
                <X className="w-5 h-5 text-surface-200" />
              </button>
            </div>

            {/* User info */}
            <div className="px-5 py-4 border-b border-surface-600 bg-surface-700/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-400/15 border border-primary-400/30 rounded-xl flex items-center justify-center text-primary-400 font-bold font-heading text-sm">
                  {initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-surface-50">{user.name}</p>
                  <p className="text-xs text-surface-200 capitalize">{user.role.replace('_', ' ')}</p>
                </div>
              </div>
            </div>

            {/* Links */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {links.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center px-3 py-2.5 rounded-xl text-sm font-medium text-surface-100 hover:bg-primary-400/10 hover:text-primary-400 transition-colors"
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            <div className="px-3 pb-6">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" /> Sign out
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Navbar;
