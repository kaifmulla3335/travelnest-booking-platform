import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useAuthStore();
  return isLoggedIn ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
