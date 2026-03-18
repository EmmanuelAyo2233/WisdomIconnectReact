import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userType = user.userType || user.role;

  if (allowedRoles && !allowedRoles.includes(userType)) {
    // If not allowed, redirect to their respective dashboard
    const dashboardRoutes = {
      mentor: '/mentor/dashboard',
      mentee: '/mentee/dashboard',
      admin: '/admin/dashboard'
    };
    return <Navigate to={dashboardRoutes[userType] || '/'} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
