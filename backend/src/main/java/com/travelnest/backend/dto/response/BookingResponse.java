package com.travelnest.backend.dto.response;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class BookingResponse {
    private Long   id;
    private String bookingRef;

    // Package info
    private String packageTitle;
    private String packageLocation;
    private String packageImageUrl;

    // User info — NEW, for admin contact purposes
    private String userName;
    private String userEmail;
    private String userPhone;

    private Integer   travelers;
    private Double    totalAmount;
    private LocalDate travelDate;
    private String    status;
    private String    paymentStatus;
    private String    razorpayPaymentId;

    // ── NEW — cancellation/refund workflow visibility ──
    private String    adminNote;       // reason shown when admin rejects/force-cancels
    private String    refundStatus;    // null if no refund exists yet
    private Double    refundAmount;    // null if no refund exists yet

    private LocalDateTime createdAt;
}