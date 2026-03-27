import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext';
import ProtectedRoute from './auth/ProtectedRoute';
import Navbar from './components/common/Navbar';
import ErrorBoundary from './components/common/ErrorBoundary';
import Spinner from './components/common/Spinner';

// Lazy-loaded pages
const LoginPage            = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage         = lazy(() => import('./pages/auth/RegisterPage'));
const PatientDashboard     = lazy(() => import('./pages/patient/PatientDashboard'));
const PatientResultDetailPage = lazy(() => import('./pages/patient/ResultDetailPage'));
const StaffDashboard       = lazy(() => import('./pages/staff/StaffDashboard'));
const AddResultPage        = lazy(() => import('./pages/staff/AddResultPage'));
const ManagePatientsPage   = lazy(() => import('./pages/staff/ManagePatientsPage'));
const StaffResultDetailPage = lazy(() => import('./pages/staff/StaffResultDetailPage'));
const AllResultsPage       = lazy(() => import('./pages/staff/AllResultsPage'));

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
    <div className="min-h-screen bg-gray-50">
      {user && <Navbar />}
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Patient */}
          <Route
            path="/patient/dashboard"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <PatientDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/results/:id"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <PatientResultDetailPage />
              </ProtectedRoute>
            }
          />

          {/* Staff */}
          <Route
            path="/staff/dashboard"
            element={
              <ProtectedRoute allowedRoles={['lab_staff']}>
                <StaffDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/results/add"
            element={
              <ProtectedRoute allowedRoles={['lab_staff']}>
                <AddResultPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/results/:id"
            element={
              <ProtectedRoute allowedRoles={['lab_staff']}>
                <StaffResultDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/patients"
            element={
              <ProtectedRoute allowedRoles={['lab_staff']}>
                <ManagePatientsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/results"
            element={
              <ProtectedRoute allowedRoles={['lab_staff']}>
                <AllResultsPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
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
