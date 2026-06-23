package com.travelnest.backend.controller;

import com.travelnest.backend.entity.Booking;
import com.travelnest.backend.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.Optional;

/**
 * Public, unauthenticated endpoint that a QR-code scan hits directly (e.g. a venue
 * staff member's phone browser — they are never logged into TravelNest).
 *
 * SECURITY: looked up by a random unguessable token (never the booking id/ref), and
 * only ever returns non-sensitive fields — no email, phone, or payment ID here.
 *
 * Because this always does a LIVE database lookup (never reads anything baked into
 * the PDF itself), cancelling a CONFIRMED booking immediately invalidates every
 * E-Ticket ever printed for it — there is no "stale PDF" possible.
 */
@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicVerifyController {

    private final BookingRepository bookingRepository;

    @GetMapping("/verify/{token}")
    public ResponseEntity<Map<String, Object>> verify(@PathVariable String token) {
        Optional<Booking> bookingOpt = bookingRepository.findByVerificationToken(token);

        if (bookingOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of(
                    "valid", false,
                    "message", "Ticket not found — invalid verification code"
            ));
        }

        Booking booking = bookingOpt.get();
        boolean valid = booking.getStatus() == Booking.BookingStatus.CONFIRMED;

        String message;
        switch (booking.getStatus()) {
            case CONFIRMED:
                message = "Valid Ticket";
                break;
            case PENDING:
                message = "Booking pending confirmation — not yet a valid ticket";
                break;
            case CANCEL_REQUESTED:
                message = "Cancellation under review — ticket not currently valid";
                break;
            case CANCELLED_BY_USER:
            case CANCELLED_BY_ADMIN:
                message = "This booking was cancelled — ticket invalid";
                break;
            default:
                message = "Unknown status";
        }

        return ResponseEntity.ok(Map.of(
                "valid", valid,
                "status", booking.getStatus().name(),
                "message", message,
                "bookingRef", "TN" + String.format("%04d", booking.getId()),
                "packageTitle", booking.getPackageEntity().getTitle(),
                "travelDate", booking.getTravelDate() != null ? booking.getTravelDate().toString() : "N/A",
                "passengerName", maskName(booking.getUser().getName())
        ));
    }

    // Privacy — a QR scan is public, so never expose a full name, email, or phone.
    // "Mohseen Attar" → "Mohseen A."
    private String maskName(String fullName) {
        if (fullName == null || fullName.isBlank()) return "N/A";
        String[] parts = fullName.trim().split("\\s+");
        if (parts.length == 1) return parts[0];
        return parts[0] + " " + parts[parts.length - 1].charAt(0) + ".";
    }
}