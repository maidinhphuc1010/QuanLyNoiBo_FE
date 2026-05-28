import { Navigate } from 'react-router-dom';
import { useAuth } from '../App';

interface PrivateRouteProps {
  children: React.ReactNode;
  roles?: string[];
}

export default function PrivateRoute({ children, roles }: PrivateRouteProps) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles?.length && user && !roles.includes(user.role)) return <Navigate to="/" replace />;

  return <>{children}</>;
}