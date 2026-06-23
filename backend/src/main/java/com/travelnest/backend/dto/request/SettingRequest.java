package com.travelnest.backend.dto.request;

import lombok.Data;

@Data
public class SettingRequest {
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