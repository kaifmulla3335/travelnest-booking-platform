import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { loginUser, registerUser } from '../services/authService';
import axiosInstance from '../api/axios';

const useAuth = () => {
  const { user, isLoggedIn, login, logout, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const navigate              = useNavigate();

  // ── Login ──────────────────────────────────────────────────
  const handleLogin = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const res = await loginUser(credentials);
      const { token, name, email, role } = res.data;

      // 1. Set basic info + token first
      const userObj = { name, email, role };
      login(userObj, token);
      localStorage.setItem('tn_token', token);

      // 2. Fetch full profile from backend (name, phone, profileImage)
      try {
        const profileRes = await axiosInstance.get('/user/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        updateUser({
          name:         profileRes.data.name,
          phone:        profileRes.data.phone,
          profileImage: profileRes.data.profileImage,
        });
      } catch (profileErr) {
        // Profile fetch fail — basic info is enough
        console.warn('Profile fetch failed:', profileErr.message);
      }

      // 3. Role-based redirect
      navigate(role === 'ADMIN' ? '/admin' : '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  // ── Register ───────────────────────────────────────────────
  const handleRegister = async (data) => {
    setLoading(true);
    setError(null);
    try {
      await registerUser(data);
      navigate('/login', { state: { registered: true } });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Logout ─────────────────────────────────────────────────
  const handleLogout = () => {
    logout();
    localStorage.removeItem('tn_token');
    localStorage.removeItem('tn_auth');
    sessionStorage.removeItem('tn_booking');
    navigate('/');
  };

  return { user, isLoggedIn, loading, error, handleLogin, handleRegister, handleLogout };
};

export default useAuth;