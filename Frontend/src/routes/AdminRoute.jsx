// ─────────────────────────────────────────────
//  AdminRoute.jsx
//  Double protection:
//  1. Must be logged in
//  2. Must have ADMIN role
//  Phase 4: JWT role claim from Spring Security
// ─────────────────────────────────────────────

import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const AdminRoute = ({ children }) => {
  const { isLoggedIn, user } = useAuthStore();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'ADMIN') {
    // Logged in but not admin — send to user dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default AdminRoute;
