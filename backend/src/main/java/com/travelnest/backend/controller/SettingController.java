package com.travelnest.backend.controller;

import com.travelnest.backend.dto.request.SettingRequest;
import com.travelnest.backend.dto.response.SettingResponse;
import com.travelnest.backend.entity.Setting;
import com.travelnest.backend.repository.SettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class SettingController {

    private final SettingRepository settingRepository;

    // ── Always reuse the FIRST existing row. Never create a second one. ──
    private Setting getOrCreate() {
        List<Setting> all = settingRepository.findAll();

        if (!all.isEmpty()) {
            return all.get(0);   // ← reuse whichever row already exists
        }

        // No row exists yet — create the one and only default row
        return settingRepository.save(Setting.builder()
                .siteName("TravelNest")
                .tagline("India's #1 Travel Platform")
                .supportEmail("hello@travelnest.in")
                .supportPhone("+919876543210")
                .currency("INR")
                .notifyNewBooking(true)
                .notifyCancellation(true)
                .notifyNewUser(false)
                .notifyPaymentFail(true)
                .notifyLowSlots(true)
                .notifyDailyReport(false)
                .razorpayKey("")
                .testMode(true)
                .autoRefund(true)
                .build());
    }

    // ── PUBLIC ──
    @GetMapping("/api/settings/public")
    public ResponseEntity<SettingResponse> getPublicSettings() {
        return ResponseEntity.ok(toResponse(getOrCreate()));
    }

    // ── ADMIN ──
    @GetMapping("/api/admin/settings")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SettingResponse> getSettings() {
        return ResponseEntity.ok(toResponse(getOrCreate()));
    }

    @PutMapping("/api/admin/settings")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SettingResponse> updateSettings(@RequestBody SettingRequest req) {
        Setting s = getOrCreate();   // gets the SAME existing row, never a new one

        if (req.getSiteName() != null)      s.setSiteName(req.getSiteName());
        if (req.getTagline() != null)       s.setTagline(req.getTagline());
        if (req.getSupportEmail() != null)  s.setSupportEmail(req.getSupportEmail());
        if (req.getSupportPhone() != null)  s.setSupportPhone(req.getSupportPhone());
        if (req.getCurrency() != null)      s.setCurrency(req.getCurrency());

        if (req.getNotifyNewBooking() != null)   s.setNotifyNewBooking(req.getNotifyNewBooking());
        if (req.getNotifyCancellation() != null) s.setNotifyCancellation(req.getNotifyCancellation());
        if (req.getNotifyNewUser() != null)      s.setNotifyNewUser(req.getNotifyNewUser());
        if (req.getNotifyPaymentFail() != null)  s.setNotifyPaymentFail(req.getNotifyPaymentFail());
        if (req.getNotifyLowSlots() != null)     s.setNotifyLowSlots(req.getNotifyLowSlots());
        if (req.getNotifyDailyReport() != null)  s.setNotifyDailyReport(req.getNotifyDailyReport());

        if (req.getRazorpayKey() != null)   s.setRazorpayKey(req.getRazorpayKey());
        if (req.getTestMode() != null)      s.setTestMode(req.getTestMode());
        if (req.getAutoRefund() != null)    s.setAutoRefund(req.getAutoRefund());

        return ResponseEntity.ok(toResponse(settingRepository.save(s)));  // updates existing row (has id already)
    }

    private SettingResponse toResponse(Setting s) {
        return SettingResponse.builder()
                .siteName(s.getSiteName())
                .tagline(s.getTagline())
                .supportEmail(s.getSupportEmail())
                .supportPhone(s.getSupportPhone())
                .currency(s.getCurrency())
                .notifyNewBooking(s.getNotifyNewBooking())
                .notifyCancellation(s.getNotifyCancellation())
                .notifyNewUser(s.getNotifyNewUser())
                .notifyPaymentFail(s.getNotifyPaymentFail())
                .notifyLowSlots(s.getNotifyLowSlots())
                .notifyDailyReport(s.getNotifyDailyReport())
                .razorpayKey(s.getRazorpayKey())
                .testMode(s.getTestMode())
                .autoRefund(s.getAutoRefund())
                .build();
    }
}