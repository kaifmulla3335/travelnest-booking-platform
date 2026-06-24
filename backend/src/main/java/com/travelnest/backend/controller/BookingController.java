package com.travelnest.backend.controller;

import com.travelnest.backend.dto.request.BookingRequest;
import com.travelnest.backend.dto.response.BookingResponse;
import com.travelnest.backend.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    // ── User: Create booking ──────────────────────────
    @PostMapping("/api/bookings")
    public ResponseEntity<BookingResponse> createBooking(
            @AuthenticationPrincipal String userEmail,
            @Valid @RequestBody BookingRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(bookingService.createBooking(userEmail, request));
    }

    // ── User: Get my bookings ─────────────────────────
    @GetMapping("/api/bookings/my")
    public ResponseEntity<List<BookingResponse>> getMyBookings(
            @AuthenticationPrincipal String userEmail) {
        return ResponseEntity.ok(bookingService.getMyBookings(userEmail));
    }

    // ── User: Request cancellation ────────────────────
    @PutMapping("/api/bookings/{id}/cancel")
    public ResponseEntity<BookingResponse> requestCancellation(
            @PathVariable Long id,
            @AuthenticationPrincipal String userEmail) {
        return ResponseEntity.ok(bookingService.requestCancellation(id, userEmail));
    }

    // ── Admin: Get all bookings ───────────────────────
    @GetMapping("/api/admin/bookings")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<BookingResponse>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    // ── Admin: Approve a PENDING booking → CONFIRMED ──
    @PutMapping("/api/admin/bookings/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookingResponse> approve(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.approveBooking(id));
    }

    // ── Admin: Reject a PENDING booking → CANCELLED_BY_ADMIN (+ full refund) ──
    @PutMapping("/api/admin/bookings/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookingResponse> reject(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        String reason = body != null ? body.get("reason") : null;
        return ResponseEntity.ok(bookingService.rejectBooking(id, reason));
    }

    // ── Admin: Force-cancel a CONFIRMED booking → CANCELLED_BY_ADMIN (+ full refund) ──
    @PutMapping("/api/admin/bookings/{id}/force-cancel")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookingResponse> forceCancel(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        String reason = body != null ? body.get("reason") : null;
        return ResponseEntity.ok(bookingService.forceCancelBooking(id, reason));
    }

    // ── Admin: Approve/reject a user's cancellation request ──
    @PutMapping("/api/admin/bookings/{id}/cancel-decision")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookingResponse> cancelDecision(
            @PathVariable Long id,
            @RequestParam boolean approve) {
        return ResponseEntity.ok(bookingService.decideCancelRequest(id, approve));
    }

    // ── User: Download my Payment Receipt (always available, no QR) ──
    @GetMapping("/api/bookings/{id}/receipt")
    public ResponseEntity<byte[]> downloadMyReceipt(
            @PathVariable Long id,
            @AuthenticationPrincipal String userEmail) {
        byte[] pdf = bookingService.generateReceiptPdf(id, userEmail);
        return pdfResponse(pdf, id, "Receipt");
    }

    // ── Admin: Download any booking's Payment Receipt ──
    @GetMapping("/api/admin/bookings/{id}/receipt")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<byte[]> downloadReceiptAsAdmin(@PathVariable Long id) {
        byte[] pdf = bookingService.generateReceiptPdfForAdmin(id);
        return pdfResponse(pdf, id, "Receipt");
    }

    // ── User: Download my own E-Ticket (PDF, with QR code) — CONFIRMED only ──
    @GetMapping("/api/bookings/{id}/ticket")
    public ResponseEntity<byte[]> downloadMyTicket(
            @PathVariable Long id,
            @AuthenticationPrincipal String userEmail) {
        byte[] pdf = bookingService.generateTicketPdf(id, userEmail);
        return pdfResponse(pdf, id, "Ticket");
    }

    // ── Admin: Download any booking's E-Ticket (PDF) — CONFIRMED only ──
    @GetMapping("/api/admin/bookings/{id}/ticket")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<byte[]> downloadTicketAsAdmin(@PathVariable Long id) {
        byte[] pdf = bookingService.generateTicketPdfForAdmin(id);
        return pdfResponse(pdf, id, "Ticket");
    }

    private ResponseEntity<byte[]> pdfResponse(byte[] pdf, Long bookingId, String kind) {
        String filename = "TravelNest-" + kind + "-TN" + String.format("%04d", bookingId) + ".pdf";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}