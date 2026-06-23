package com.travelnest.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "package_id", nullable = false)
    private Package packageEntity;

    private Integer   travelers;
    private Double    totalAmount;
    private LocalDate travelDate;
    private String    specialRequests;

    @Enumerated(EnumType.STRING)
    private BookingStatus status;

    // ── Tracks what the status was right before a cancellation request was raised,
    //     so admin's "Reject cancellation" can revert to the correct prior state ──
    @Enumerated(EnumType.STRING)
    private BookingStatus previousStatus;

    @Enumerated(EnumType.STRING)
    private PaymentStatus paymentStatus;

    // ── Razorpay trace fields — links this booking to the actual payment ──
    private String razorpayOrderId;
    private String razorpayPaymentId;

    // ── QR verification — random, unguessable token. NEVER use booking id/ref here;
    //     a sequential ref would let anyone enumerate every booking on the public
    //     verify endpoint. This token is only ever embedded in the final E-Ticket QR. ──
    @Column(unique = true)
    private String verificationToken;

    // ── Reason shown to the user when admin rejects / force-cancels a booking ──
    private String adminNote;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public enum BookingStatus {
        PENDING,              // paid, awaiting admin review
        CONFIRMED,            // admin approved — E-Ticket + QR unlock
        CANCEL_REQUESTED,     // user asked to cancel an active booking, awaiting admin decision
        CANCELLED_BY_USER,    // admin approved the user's cancellation request
        CANCELLED_BY_ADMIN    // admin rejected at review stage, OR force-cancelled a confirmed booking
    }

    public enum PaymentStatus {
        PAID,
        REFUNDED
    }
}