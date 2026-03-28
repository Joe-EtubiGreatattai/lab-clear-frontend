import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { FlaskConical, LogOut, User, Menu, X, ChevronDown } from 'lucide-react';

const NavLink = ({ to, end = false, children, onClick }) => {
  const { pathname } = useLocation();
  const active = end ? pathname === to : (pathname === to || pathname.startsWith(to + '/'));
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`relative text-sm font-medium px-1 py-0.5 transition-colors duration-150
        ${active
          ? 'text-primary-600'
          : 'text-slate-600 hover:text-slate-900'
        }`}
    >
      {children}
      {active && (
        <span className="absolute -bottom-[1px] left-0 right-0 h-0.5 bg-primary-600 rounded-full" />
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

  const links = user?.role === 'lab_staff' ? staffLinks : patientLinks;

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
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center shadow-sm">
                <FlaskConical className="w-4.5 h-4.5 text-white" strokeWidth={2.2} />
              </div>
              <span className="font-heading font-bold text-lg text-slate-900 tracking-tight">LabClear</span>
            </Link>

            {/* Desktop nav links */}
            {user && (
              <div className="hidden md:flex items-center gap-6 border-b border-transparent h-full">
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
                      className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all duration-150"
                    >
                      <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {initials}
                      </div>
                      <div className="text-left hidden lg:block">
                        <p className="text-sm font-semibold text-slate-800 leading-none">{user.name}</p>
                        <p className="text-xs text-slate-400 capitalize mt-0.5">{user.role.replace('_', ' ')}</p>
                      </div>
                      <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 ${userMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {userMenuOpen && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-modal border border-slate-100 py-1.5 z-20 animate-fadeIn">
                          <div className="px-3 py-2 border-b border-slate-100 mb-1">
                            <p className="text-xs font-semibold text-slate-800">{user.name}</p>
                            <p className="text-xs text-slate-400">{user.email}</p>
                          </div>
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <LogOut className="w-4 h-4" /> Sign out
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Mobile hamburger */}
                  <button
                    className="md:hidden p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
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
            className="fixed inset-0 bg-black/30 z-40 md:hidden backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed top-0 right-0 h-full w-72 bg-white z-50 shadow-modal flex flex-col animate-slideIn md:hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <FlaskConical className="w-4 h-4 text-white" />
                </div>
                <span className="font-heading font-bold text-slate-900">LabClear</span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* User info */}
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                  {initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{user.name}</p>
                  <p className="text-xs text-slate-400 capitalize">{user.role.replace('_', ' ')}</p>
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
                  className="flex items-center px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-primary-50 hover:text-primary-700 transition-colors"
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            <div className="px-3 pb-6">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
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
