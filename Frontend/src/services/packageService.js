import axiosInstance from '../api/axios';
// import packages from '../data/dummyPackages';

// // DUMMY — Phase 1
// export const getAllPackages = async () => {
//   await new Promise((r) => setTimeout(r, 500));
//   return { data: packages };
// };

// export const getPackageById = async (id) => {
//   await new Promise((r) => setTimeout(r, 300));
//   const pkg = packages.find((p) => p.id === Number(id));
//   if (!pkg) throw new Error('Package not found');
//   return { data: pkg };
// };

// When backend ready — replace with:
// ── API calls ──────────────────────────
export const getAllPackages  = ()    => axiosInstance.get('/packages');
export const getPackageById = (id)  => axiosInstance.get(`/packages/${id}`);

// Admin only
export const createPackage  = (data) => axiosInstance.post('/admin/packages', data);
export const updatePackage  = (id, data) => axiosInstance.put(`/admin/packages/${id}`, data);
export const deletePackage  = (id)  => axiosInstance.delete(`/admin/packages/${id}`);
