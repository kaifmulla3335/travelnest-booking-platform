package com.travelnest.backend.dto.response;

import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class SettingResponse {
    private String  siteName;
    private String  tagline;
    private String  supportEmail;
    private String  supportPhone;
    private String  currency;

    private Boolean notifyNewBooking;
    private Boolean notifyCancellation;
    private Boolean notifyNewUser;
    private Boolean notifyPaymentFail;
    private Boolean notifyLowSlots;
    private Boolean notifyDailyReport;

    private String  razorpayKey;
    private Boolean testMode;
    private Boolean autoRefund;
}