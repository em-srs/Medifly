import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ fontSize: '1.2rem', color: 'var(--color-primary)' }}>Loading Medifly Session...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect user to their appropriate role home if trying to access unauthorized route
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'pharmacy') return <Navigate to="/pharmacy" replace />;
    if (user.role === 'rider') return <Navigate to="/rider" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
