import { useState } from 'react';
import { createBooking, getMyBookings, cancelBooking } from '../services/bookingService';

const useBooking = () => {
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [bookings, setBookings] = useState([]);

const fetchMyBookings = async () => {
  setLoading(true);

  try {
    const res = await getMyBookings();

    const formattedBookings = res.data.map(b => ({
      id: b.bookingRef,
      packageTitle: b.packageTitle,
      destination: b.packageLocation,
      date: b.travelDate,
      amount: b.totalAmount,
      travelers: b.travelers,
      status: b.status,
    }));

    setBookings(formattedBookings);

  } catch (err) {
    setError(err.response?.data?.message || err.message);
  } finally {
    setLoading(false);
  }
};

  const book = async (data) => {
    setLoading(true);
    try {
      const res = await createBooking(data);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cancel = async (id) => {
    setLoading(true);
    try {
      await cancelBooking(id);
      setBookings(prev => prev.map(b =>
        b.id === id ? { ...b, status: 'CANCELLED' } : b
      ));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { bookings, loading, error, fetchMyBookings, book, cancel };
};

export default useBooking;