package com.travelnest.backend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class BookingRequest {

    @NotNull
    private Long packageId;

    @NotNull
    private Integer travelers;

    @NotNull
    private LocalDate travelDate;

    private String specialRequests;

    // ── Sent ONLY after Razorpay checkout succeeds (see PaymentPage.jsx) ──
    // Backend re-verifies these before trusting the payment — see BookingServiceImpl
    private String razorpayOrderId;
    private String razorpayPaymentId;
    private String razorpaySignature;
}