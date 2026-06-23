import axiosInstance from '../api/axios';

// ── API calls ──────────────────────────
export const loginUser = ({ email, password }) =>
  axiosInstance.post('/auth/login', { email, password });

export const registerUser = (data) =>
  axiosInstance.post('/auth/register', {
    name:     `${data.firstName} ${data.lastName}`,
    email:    data.email,
    password: data.password,
    phone:    data.phone,
  });