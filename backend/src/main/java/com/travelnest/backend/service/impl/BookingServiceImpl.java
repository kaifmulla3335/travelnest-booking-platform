package com.travelnest.backend.service.impl;

import com.razorpay.RazorpayClient;
import com.razorpay.Utils;
import com.travelnest.backend.dto.request.BookingRequest;
import com.travelnest.backend.dto.response.BookingResponse;
import com.travelnest.backend.entity.Booking;
import com.travelnest.backend.entity.Package;
import com.travelnest.backend.entity.Refund;
import com.travelnest.backend.entity.Setting;
import com.travelnest.backend.entity.User;
import com.travelnest.backend.repository.BookingRepository;
import com.travelnest.backend.repository.PackageRepository;
import com.travelnest.backend.repository.RefundRepository;
import com.travelnest.backend.repository.SettingRepository;
import com.travelnest.backend.repository.UserRepository;
import com.travelnest.backend.service.BookingService;
import com.travelnest.backend.service.TicketService;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository  bookingRepository;
    private final UserRepository     userRepository;
    private final PackageRepository  packageRepository;
    private final SettingRepository  settingRepository;
    private final RefundRepository   refundRepository;
    private final TicketService      ticketService;

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    // ═══════════════════════════ CREATE ═══════════════════════════

    @Override
    public BookingResponse createBooking(String userEmail, BookingRequest req) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Package pkg = packageRepository.findById(req.getPackageId())
                .orElseThrow(() -> new RuntimeException("Package not found"));

        // Same formula as PaymentController.createOrder() and the frontend — kept in
        // sync so the booking record always reflects the amount actually charged.
        double base  = pkg.getPrice() * req.getTravelers();
        double tax   = Math.round(base * 0.05);
        double total = base + tax;

        // ── Payment proof is mandatory — booking is never created without it ──
        if (req.getRazorpayOrderId() == null || req.getRazorpayPaymentId() == null || req.getRazorpaySignature() == null) {
            throw new RuntimeException("Payment verification details missing. Please complete payment first.");
        }

        JSONObject options = new JSONObject();
        options.put("razorpay_order_id", req.getRazorpayOrderId());
        options.put("razorpay_payment_id", req.getRazorpayPaymentId());
        options.put("razorpay_signature", req.getRazorpaySignature());

        boolean paymentValid;
        try {
            paymentValid = Utils.verifyPaymentSignature(options, razorpayKeySecret);
        } catch (Exception e) {
            throw new RuntimeException("Payment verification failed: " + e.getMessage());
        }

        if (!paymentValid) {
            throw new RuntimeException("Invalid payment signature. Booking not created.");
        }

        Booking booking = Booking.builder()
                .user(user)
                .packageEntity(pkg)
                .travelers(req.getTravelers())
                .totalAmount(total)
                .travelDate(req.getTravelDate())
                .specialRequests(req.getSpecialRequests())
                .status(Booking.BookingStatus.PENDING)
                .paymentStatus(Booking.PaymentStatus.PAID)
                .razorpayOrderId(req.getRazorpayOrderId())
                .razorpayPaymentId(req.getRazorpayPaymentId())
                // Random, unguessable — this is what the E-Ticket QR will encode later.
                // Never use the booking id/ref for this; sequential refs are enumerable.
                .verificationToken(UUID.randomUUID().toString())
                .build();

        return toResponse(bookingRepository.save(booking));
    }

    @Override
    public List<BookingResponse> getMyBookings(String userEmail) {
        return bookingRepository.findByUserEmailOrderByCreatedAtDesc(userEmail)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    // ═══════════════════════════ USER ACTIONS ═══════════════════════════

    @Override
    public BookingResponse requestCancellation(Long bookingId, String userEmail) {
        Booking booking = getBookingOrThrow(bookingId);

        if (!booking.getUser().getEmail().equals(userEmail)) {
            throw new RuntimeException("Unauthorized");
        }
        if (booking.getStatus() != Booking.BookingStatus.PENDING
                && booking.getStatus() != Booking.BookingStatus.CONFIRMED) {
            throw new RuntimeException("This booking cannot be cancelled in its current state");
        }

        // Remember what it was, so admin's "reject cancellation" can revert correctly
        booking.setPreviousStatus(booking.getStatus());
        booking.setStatus(Booking.BookingStatus.CANCEL_REQUESTED);
        return toResponse(bookingRepository.save(booking));
    }

    // ═══════════════════════════ ADMIN ACTIONS ═══════════════════════════

    @Override
    public BookingResponse approveBooking(Long id) {
        Booking booking = getBookingOrThrow(id);
        if (booking.getStatus() != Booking.BookingStatus.PENDING) {
            throw new RuntimeException("Only PENDING bookings can be approved");
        }
        booking.setStatus(Booking.BookingStatus.CONFIRMED);
        return toResponse(bookingRepository.save(booking));
    }

    @Override
    public BookingResponse rejectBooking(Long id, String reason) {
        Booking booking = getBookingOrThrow(id);
        if (booking.getStatus() != Booking.BookingStatus.PENDING) {
            throw new RuntimeException("Only PENDING bookings can be rejected");
        }
        booking.setStatus(Booking.BookingStatus.CANCELLED_BY_ADMIN);
        booking.setAdminNote(reason);
        // Not the customer's fault — always full refund, regardless of tour date.
        processRefund(booking, booking.getTotalAmount(), "Admin rejected booking" + (reason != null ? ": " + reason : ""));
        return toResponse(bookingRepository.save(booking));
    }

    @Override
    public BookingResponse forceCancelBooking(Long id, String reason) {
        Booking booking = getBookingOrThrow(id);
        if (booking.getStatus() != Booking.BookingStatus.CONFIRMED) {
            throw new RuntimeException("Only CONFIRMED bookings can be force-cancelled");
        }
        booking.setStatus(Booking.BookingStatus.CANCELLED_BY_ADMIN);
        booking.setAdminNote(reason);
        // Operator's fault — always full refund, regardless of tour date.
        processRefund(booking, booking.getTotalAmount(), "Operator cancelled tour" + (reason != null ? ": " + reason : ""));
        return toResponse(bookingRepository.save(booking));
    }

    @Override
    public BookingResponse decideCancelRequest(Long id, boolean approve) {
        Booking booking = getBookingOrThrow(id);
        if (booking.getStatus() != Booking.BookingStatus.CANCEL_REQUESTED) {
            throw new RuntimeException("This booking has no pending cancellation request");
        }

        if (approve) {
            double refundAmount = calculateRefundAmount(booking);
            long daysLeft = ChronoUnit.DAYS.between(java.time.LocalDate.now(), booking.getTravelDate());
            booking.setStatus(Booking.BookingStatus.CANCELLED_BY_USER);
            processRefund(booking, refundAmount,
                    "User-requested cancellation — " + daysLeft + " day(s) left before tour");
        } else {
            // Revert to whatever it was before the cancellation request
            booking.setStatus(booking.getPreviousStatus() != null
                    ? booking.getPreviousStatus() : Booking.BookingStatus.CONFIRMED);
        }
        return toResponse(bookingRepository.save(booking));
    }

    // ═══════════════════════════ REFUND HELPERS ═══════════════════════════

    // Same 7-day policy used on the frontend — kept here too since the actual
    // Razorpay refund call happens server-side and must never trust a client-sent amount.
    private double calculateRefundAmount(Booking booking) {
        long daysLeft = ChronoUnit.DAYS.between(java.time.LocalDate.now(), booking.getTravelDate());
        return daysLeft >= 7 ? booking.getTotalAmount() : 0.0;
    }

    // Creates (or reuses) the Refund audit record and attempts the Razorpay refund.
    // IMPORTANT: a failed Razorpay call does NOT block the booking's cancellation —
    // the trip is off either way; the refund is simply flagged FAILED for admin retry,
    // rather than leaving the customer stuck with a booking they can't get out of.
    private void processRefund(Booking booking, double amount, String reason) {
        // Idempotency — don't double-refund if this is somehow called twice
        Optional<Refund> existing = refundRepository.findByBookingId(booking.getId());
        if (existing.isPresent()) return;

        Refund refund = Refund.builder()
                .booking(booking)
                .amount(amount)
                .reason(reason)
                .initiatedAt(LocalDateTime.now())
                .build();

        if (amount <= 0) {
            refund.setStatus(Refund.RefundStatus.NOT_ELIGIBLE);
            refundRepository.save(refund);
            return; // payment stays PAID — no money actually moved
        }

        if (booking.getRazorpayPaymentId() == null) {
            refund.setStatus(Refund.RefundStatus.FAILED);
            refundRepository.save(refund);
            return;
        }

        try {
            RazorpayClient client = new RazorpayClient(razorpayKeyId, razorpayKeySecret);
            JSONObject refundRequest = new JSONObject();
            refundRequest.put("amount", (int) Math.round(amount * 100)); // paise
            com.razorpay.Refund razorpayRefund = client.payments.refund(booking.getRazorpayPaymentId(), refundRequest);

            refund.setRazorpayRefundId(razorpayRefund.get("id"));
            refund.setStatus(Refund.RefundStatus.INITIATED);
            // Test mode settles instantly; in production this would flip to COMPLETED
            // via a Razorpay webhook instead of being assumed here.
            refund.setCompletedAt(LocalDateTime.now());
            booking.setPaymentStatus(Booking.PaymentStatus.REFUNDED);
        } catch (Exception e) {
            refund.setStatus(Refund.RefundStatus.FAILED);
            // Booking still gets cancelled — admin can see the FAILED refund and retry manually.
        }

        refundRepository.save(refund);
    }

    // ═══════════════════════════ TICKET PDF ═══════════════════════════

    @Override
    public byte[] generateReceiptPdf(Long bookingId, String userEmail) {
        Booking booking = getBookingOrThrow(bookingId);
        if (!booking.getUser().getEmail().equals(userEmail)) {
            throw new RuntimeException("Unauthorized — this receipt does not belong to you");
        }
        return buildReceiptPdf(booking);
    }

    @Override
    public byte[] generateReceiptPdfForAdmin(Long bookingId) {
        Booking booking = getBookingOrThrow(bookingId);
        return buildReceiptPdf(booking);
    }

    @Override
    public byte[] generateTicketPdf(Long bookingId, String userEmail) {
        Booking booking = getBookingOrThrow(bookingId);
        if (!booking.getUser().getEmail().equals(userEmail)) {
            throw new RuntimeException("Unauthorized — this ticket does not belong to you");
        }
        return buildTicketPdf(booking);
    }

    @Override
    public byte[] generateTicketPdfForAdmin(Long bookingId) {
        Booking booking = getBookingOrThrow(bookingId);
        return buildTicketPdf(booking);
    }

    private byte[] buildReceiptPdf(Booking booking) {
        SettingInfo s = resolveSettingInfo();
        try {
            return ticketService.generateReceiptPdf(booking, s.siteName, s.supportEmail, s.supportPhone);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate receipt PDF: " + e.getMessage());
        }
    }

    private byte[] buildTicketPdf(Booking booking) {
        if (booking.getStatus() != Booking.BookingStatus.CONFIRMED) {
            throw new RuntimeException("E-Ticket is only available once your booking is confirmed. Download your payment receipt instead.");
        }
        SettingInfo s = resolveSettingInfo();
        try {
            return ticketService.generateTicketPdf(booking, s.siteName, s.supportEmail, s.supportPhone);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate ticket PDF: " + e.getMessage());
        }
    }

    private SettingInfo resolveSettingInfo() {
        Setting s = settingRepository.findAll().stream().findFirst().orElse(null);
        return new SettingInfo(
                (s != null && s.getSiteName() != null)     ? s.getSiteName()     : "TravelNest",
                (s != null && s.getSupportEmail() != null) ? s.getSupportEmail() : "hello@travelnest.in",
                (s != null && s.getSupportPhone() != null) ? s.getSupportPhone() : "+919876543210"
        );
    }

    private record SettingInfo(String siteName, String supportEmail, String supportPhone) {}

    // ═══════════════════════════ HELPERS ═══════════════════════════

    private Booking getBookingOrThrow(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
    }

    private BookingResponse toResponse(Booking b) {
        Refund refund = refundRepository.findByBookingId(b.getId()).orElse(null);

        return BookingResponse.builder()
                .id(b.getId())
                .bookingRef("TN" + String.format("%04d", b.getId()))
                .packageTitle(b.getPackageEntity().getTitle())
                .packageLocation(b.getPackageEntity().getLocation())
                .packageImageUrl(b.getPackageEntity().getImageUrl())
                .userName(b.getUser().getName())
                .userEmail(b.getUser().getEmail())
                .userPhone(b.getUser().getPhone())
                .travelers(b.getTravelers())
                .totalAmount(b.getTotalAmount())
                .travelDate(b.getTravelDate())
                .status(b.getStatus().name())
                .paymentStatus(b.getPaymentStatus().name())
                .razorpayPaymentId(b.getRazorpayPaymentId())
                .adminNote(b.getAdminNote())
                .refundStatus(refund != null ? refund.getStatus().name() : null)
                .refundAmount(refund != null ? refund.getAmount() : null)
                .createdAt(b.getCreatedAt())
                .build();
    }
}