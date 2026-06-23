import axiosInstance from '../api/axios';

// Create booking
export const createBooking = (data) =>
  axiosInstance.post('/bookings', data);

// Get my bookings
export const getMyBookings = () =>
  axiosInstance.get('/bookings/my');

// User: request cancellation (→ CANCEL_REQUESTED, awaits admin decision)
export const cancelBooking = (id) =>
  axiosInstance.put(`/bookings/${id}/cancel`);

// ── Admin actions — explicit state-machine endpoints ──
export const approveBooking = (id) =>
  axiosInstance.put(`/admin/bookings/${id}/approve`);

export const rejectBooking = (id, reason) =>
  axiosInstance.put(`/admin/bookings/${id}/reject`, { reason });

export const forceCancelBooking = (id, reason) =>
  axiosInstance.put(`/admin/bookings/${id}/force-cancel`, { reason });

export const decideCancelRequest = (id, approve) =>
  axiosInstance.put(`/admin/bookings/${id}/cancel-decision?approve=${approve}`);

// ── Download PDFs (Receipt = always available, no QR; Ticket = CONFIRMED-only, with QR) ──
const triggerPdfDownload = async (url, filename) => {
  const res = await axiosInstance.get(url, { responseType: 'blob' });
  const blob = new Blob([res.data], { type: 'application/pdf' });
  const objectUrl = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = objectUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(objectUrl);
};

export const downloadReceipt = (bookingId, bookingRef) =>
  triggerPdfDownload(`/bookings/${bookingId}/receipt`, `TravelNest-Receipt-${bookingRef || bookingId}.pdf`);

export const downloadTicket = (bookingId, bookingRef) =>
  triggerPdfDownload(`/bookings/${bookingId}/ticket`, `TravelNest-Ticket-${bookingRef || bookingId}.pdf`);

export const downloadReceiptAdmin = (bookingId, bookingRef) =>
  triggerPdfDownload(`/admin/bookings/${bookingId}/receipt`, `TravelNest-Receipt-${bookingRef || bookingId}.pdf`);

export const downloadTicketAdmin = (bookingId, bookingRef) =>
  triggerPdfDownload(`/admin/bookings/${bookingId}/ticket`, `TravelNest-Ticket-${bookingRef || bookingId}.pdf`);