import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext';
import ProtectedRoute from './auth/ProtectedRoute';
import Sidebar from './components/common/Sidebar';
import ErrorBoundary from './components/common/ErrorBoundary';
import Spinner from './components/common/Spinner';

// Lazy-loaded pages
const LoginPage            = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage         = lazy(() => import('./pages/auth/RegisterPage'));
const PatientDashboard     = lazy(() => import('./pages/patient/PatientDashboard'));
const PatientResultDetailPage = lazy(() => import('./pages/patient/ResultDetailPage'));
const PatientResultChatPage   = lazy(() => import('./pages/patient/ResultChatPage'));
const ProfilePage             = lazy(() => import('./pages/patient/ProfilePage'));
const StaffDashboard       = lazy(() => import('./pages/staff/StaffDashboard'));
const AddResultPage        = lazy(() => import('./pages/staff/AddResultPage'));
const ManagePatientsPage   = lazy(() => import('./pages/staff/ManagePatientsPage'));
const PatientHistoryPage   = lazy(() => import('./pages/staff/PatientHistoryPage'));
const AddDiagnosisPage     = lazy(() => import('./pages/staff/AddDiagnosisPage'));
const StaffResultDetailPage = lazy(() => import('./pages/staff/StaffResultDetailPage'));
const StaffResultChatPage   = lazy(() => import('./pages/staff/StaffResultChatPage'));
const AllResultsPage       = lazy(() => import('./pages/staff/AllResultsPage'));
const DrugVerificationPage = lazy(() => import('./pages/shared/DrugVerificationPage'));

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <Spinner size="md" />
  </div>
);

const RootRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'patient' ? '/patient/dashboard' : '/staff/dashboard'} replace />;
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-surface-50 flex">
      {user && <Sidebar />}

      {/* Main content — offset for sidebar on desktop, top-bar on mobile */}
      <div className={`flex-1 min-w-0 flex flex-col ${user ? 'lg:pl-64 pt-14 lg:pt-0' : ''}`}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public */}
            <Route path="/login"    element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Patient */}
            <Route path="/patient/dashboard" element={
              <ProtectedRoute allowedRoles={['patient']}><PatientDashboard /></ProtectedRoute>
            } />
            <Route path="/patient/results/:id" element={
              <ProtectedRoute allowedRoles={['patient']}><PatientResultDetailPage /></ProtectedRoute>
            } />
            <Route path="/patient/results/:id/chat" element={
              <ProtectedRoute allowedRoles={['patient']}><PatientResultChatPage /></ProtectedRoute>
            } />
            <Route path="/patient/profile" element={
              <ProtectedRoute allowedRoles={['patient']}><ProfilePage /></ProtectedRoute>
            } />

            {/* Staff */}
            <Route path="/staff/dashboard" element={
              <ProtectedRoute allowedRoles={['lab_staff', 'doctor']}><StaffDashboard /></ProtectedRoute>
            } />
            <Route path="/staff/results/add" element={
              <ProtectedRoute allowedRoles={['lab_staff', 'doctor']}><AddResultPage /></ProtectedRoute>
            } />
            <Route path="/staff/results/:id" element={
              <ProtectedRoute allowedRoles={['lab_staff', 'doctor']}><StaffResultDetailPage /></ProtectedRoute>
            } />
            <Route path="/staff/results/:id/chat" element={
              <ProtectedRoute allowedRoles={['lab_staff', 'doctor']}><StaffResultChatPage /></ProtectedRoute>
            } />
            <Route path="/staff/patients" element={
              <ProtectedRoute allowedRoles={['lab_staff', 'doctor']}><ManagePatientsPage /></ProtectedRoute>
            } />
            <Route path="/staff/patients/:id/history" element={
              <ProtectedRoute allowedRoles={['lab_staff', 'doctor']}><PatientHistoryPage /></ProtectedRoute>
            } />
            <Route path="/staff/results" element={
              <ProtectedRoute allowedRoles={['lab_staff', 'doctor']}><AllResultsPage /></ProtectedRoute>
            } />

            {/* Shared */}
            <Route path="/verify-drug" element={
              <ProtectedRoute allowedRoles={['lab_staff', 'doctor', 'patient']}><DrugVerificationPage /></ProtectedRoute>
            } />

            {/* Fallback */}
            <Route path="/"  element={<RootRedirect />} />
            <Route path="*"  element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </div>
    </div>
  );
};

const App = () => (
  <ErrorBoundary>
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  </ErrorBoundary>
);

export default App;
