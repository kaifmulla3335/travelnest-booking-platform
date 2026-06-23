package com.travelnest.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * One row per cancelled booking — kept separate from Booking/PaymentStatus on purpose.
 * A payment record should never be "edited" once money is collected; a refund is a
 * related-but-distinct event with its own lifecycle (initiated → completed/failed).
 */
@Entity
@Table(name = "refunds")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Refund {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false, unique = true)
    private Booking booking;

    @Enumerated(EnumType.STRING)
    private RefundStatus status;

    private Double amount;

    // Filled once Razorpay confirms the refund (null if NOT_ELIGIBLE or FAILED)
    private String razorpayRefundId;

    // e.g. "User cancelled — 8 days left (full refund)", "Admin rejected booking", "Operator cancelled tour"
    private String reason;

    private LocalDateTime initiatedAt;
    private LocalDateTime completedAt;   // nullable until confirmed

    public enum RefundStatus {
        NOT_ELIGIBLE,   // cancelled within the no-refund window — refund amount = 0
        INITIATED,      // Razorpay refund API call succeeded, processing (1–7 business days in real mode)
        COMPLETED,      // refund confirmed (in test mode this settles instantly)
        FAILED          // Razorpay call failed — needs admin attention / manual retry
    }
}