import { useState, useEffect } from 'react';
import { getAllPackages, getPackageById } from '../services/packageService';

// Normalize backend response — maps all fields properly
const normalizePackage = (p) => ({
  ...p,
  slots:           p.availableSlots ?? p.slots ?? 0,
  availableSlots:  p.availableSlots ?? p.slots ?? 0,
  image:           p.imageUrl || p.image || null,
  imageUrl:        p.imageUrl || p.image || null,
  tourStartDate:   p.tourStartDate   || null,
  tourEndDate:     p.tourEndDate     || null,
  bookingDeadline: p.bookingDeadline || null,
});

export const usePackages = () => {
  const [packages, setPackages] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    getAllPackages()
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : res.data?.content || [];
        setPackages(data.map(normalizePackage));
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { packages, loading, error };
};

export const usePackageById = (id) => {
  const [pkg,     setPkg]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getPackageById(id)
      .then(res => setPkg(normalizePackage(res.data)))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  return { pkg, loading, error };
};