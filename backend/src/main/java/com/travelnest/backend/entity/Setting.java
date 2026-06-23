package com.travelnest.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "settings")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Setting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Site Info
    private String siteName;
    private String tagline;
    private String supportEmail;
    private String supportPhone;
    private String currency;

    // Notifications
    private Boolean notifyNewBooking;
    private Boolean notifyCancellation;
    private Boolean notifyNewUser;
    private Boolean notifyPaymentFail;
    private Boolean notifyLowSlots;
    private Boolean notifyDailyReport;

    // Payment
    private String  razorpayKey;
    private Boolean testMode;
    private Boolean autoRefund;
}