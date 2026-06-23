import { create } from 'zustand';

// Simple in-memory store — resets on refresh (Phase 3 mein backend se replace hoga)
const DUMMY_BOOKINGS = [
  { id:'TN2048', packageTitle:'Goa Beach Getaway',  destination:'Goa, India',    date:'2025-02-15', amount:18999, travelers:1, status:'CONFIRMED' },
  { id:'TN2047', packageTitle:'Kerala Backwaters',  destination:'Kerala, India',  date:'2025-03-22', amount:24500, travelers:2, status:'PENDING'   },
  { id:'TN2046', packageTitle:'Ladakh Adventure',   destination:'Ladakh, India',  date:'2024-12-10', amount:28000, travelers:1, status:'CONFIRMED' },
];

const useBookingStore = create((set) => ({
  bookings: DUMMY_BOOKINGS,

  addBooking: (booking) => set((state) => ({
    bookings: [booking, ...state.bookings],
  })),

  cancelBooking: (id) => set((state) => ({
    bookings: state.bookings.map(b =>
      b.id === id ? { ...b, status: 'CANCELLED' } : b
    ),
  })),
}));

export default useBookingStore;