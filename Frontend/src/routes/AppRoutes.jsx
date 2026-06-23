import { Routes, Route } from 'react-router-dom';
import MainLayout     from '../layouts/MainLayout';
import AdminLayout    from '../layouts/AdminLayout';
import ProtectedRoute from './ProtectedRoute';
import AdminRoute     from './AdminRoute';

import HomePage       from '../pages/home/HomePage';
import PackagesPage   from '../pages/packages/PackagesPage';
import PackageDetail  from '../pages/packages/PackageDetail';
import LoginPage      from '../pages/auth/LoginPage';
import RegisterPage   from '../pages/auth/RegisterPage';
import AboutPage      from '../pages/home/AboutPage';
import ContactPage    from '../pages/home/ContactPage';
import DashboardPage  from '../pages/profile/DashboardPage';
import ProfilePage    from '../pages/profile/ProfilePage';
import BookingPage    from '../pages/booking/BookingPage';
import PaymentPage    from '../pages/booking/PaymentPage';
import SuccessPage    from '../pages/booking/SuccessPage';

import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminPackages  from '../pages/admin/AdminPackages';
import AdminBookings  from '../pages/admin/AdminBookings';
import AdminUsers     from '../pages/admin/AdminUsers';
import AdminRevenue   from '../pages/admin/AdminRevenue';
import AdminSettings  from '../pages/admin/AdminSettings';
import VerifyPage     from '../pages/public/VerifyPage';

const AppRoutes = () => (
  <Routes>
    {/* Public — no login, no nav/footer. Opened directly by scanning an E-Ticket QR code. */}
    <Route path="/verify/:token" element={<VerifyPage />} />

    <Route element={<MainLayout />}>
      <Route path="/"             element={<HomePage />} />
      <Route path="/packages"     element={<PackagesPage />} />
      <Route path="/packages/:id" element={<PackageDetail />} />
      <Route path="/about"        element={<AboutPage />} />
      <Route path="/contact"      element={<ContactPage />} />
      <Route path="/login"        element={<LoginPage />} />
      <Route path="/register"     element={<RegisterPage />} />
      <Route path="/dashboard"    element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/profile"      element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/booking/:id"  element={<ProtectedRoute><BookingPage /></ProtectedRoute>} />
      <Route path="/payment"      element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
      <Route path="/success"      element={<ProtectedRoute><SuccessPage /></ProtectedRoute>} />
    </Route>

    <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
      <Route index            element={<AdminDashboard />} />
      <Route path="packages"  element={<AdminPackages />} />
      <Route path="bookings"  element={<AdminBookings />} />
      <Route path="users"     element={<AdminUsers />} />
      <Route path="revenue"   element={<AdminRevenue />} />
      <Route path="settings"  element={<AdminSettings />} />
    </Route>
  </Routes>
);

export default AppRoutes;