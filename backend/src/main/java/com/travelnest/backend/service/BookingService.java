package com.travelnest.backend.service;

import com.travelnest.backend.dto.request.BookingRequest;
import com.travelnest.backend.dto.response.BookingResponse;
import java.util.List;

public interface BookingService {
    BookingResponse createBooking(String userEmail, BookingRequest request);
    List<BookingResponse> getMyBookings(String userEmail);
    List<BookingResponse> getAllBookings();

    // ── User actions ──
    BookingResponse requestCancellation(Long bookingId, String userEmail);

    // ── Admin actions — explicit state-machine transitions (no generic "set any status") ──
    BookingResponse approveBooking(Long id);                         // PENDING → CONFIRMED
    BookingResponse rejectBooking(Long id, String reason);           // PENDING → CANCELLED_BY_ADMIN (+full refund)
    BookingResponse forceCancelBooking(Long id, String reason);      // CONFIRMED → CANCELLED_BY_ADMIN (+full refund)
    BookingResponse decideCancelRequest(Long id, boolean approve);   // CANCEL_REQUESTED → CANCELLED_BY_USER (+policy refund) or revert

    // ── Legacy bridge — kept so old frontend code (status=CONFIRMED/CANCELLED) keeps
    //     working until the admin UI is migrated to the explicit endpoints above.
    //     Internally dispatches to the correct state-machine method based on current status.
    BookingResponse legacyUpdateStatus(Long id, String targetStatus);

    // ── PDF documents ──
    byte[] generateReceiptPdf(Long bookingId, String userEmail);       // always available once paid
    byte[] generateReceiptPdfForAdmin(Long bookingId);
    byte[] generateTicketPdf(Long bookingId, String userEmail);       // owner-only, CONFIRMED-only
    byte[] generateTicketPdfForAdmin(Long bookingId);                  // admin — CONFIRMED-only
}