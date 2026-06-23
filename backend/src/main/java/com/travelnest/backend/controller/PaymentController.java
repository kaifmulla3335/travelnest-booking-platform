package com.travelnest.backend.controller;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.Utils;
import com.travelnest.backend.entity.Package;
import com.travelnest.backend.repository.PackageRepository;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final PackageRepository packageRepository;

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    // ── Step 1: Create a Razorpay Order ──────────────────────
    // Frontend calls this BEFORE opening the Razorpay checkout widget.
    //
    // SECURITY NOTE: amount is recomputed HERE on the server from packageId + travelers.
    // We never trust a raw "amount" sent by the client — otherwise anyone could open
    // DevTools/Postman, send amount: 1, and pay ₹1 for a real booking while still
    // getting a validly-signed Razorpay payment.
    @PostMapping("/create-order")
    public ResponseEntity<Map<String, Object>> createOrder(@RequestBody Map<String, Object> body) throws Exception {
        Long packageId = Long.parseLong(body.get("packageId").toString());
        int travelers  = Integer.parseInt(body.get("travelers").toString());

        Package pkg = packageRepository.findById(packageId)
                .orElseThrow(() -> new RuntimeException("Package not found"));

        // Same formula the frontend uses for display — kept in sync so the price
        // shown to the user always matches what actually gets charged.
        double base  = pkg.getPrice() * travelers;
        double tax   = Math.round(base * 0.05);
        double total = base + tax;
        int amountInPaise = (int) Math.round(total * 100);

        RazorpayClient client = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", amountInPaise);
        orderRequest.put("currency", "INR");
        orderRequest.put("receipt", "tn_" + System.currentTimeMillis());

        Order order = client.orders.create(orderRequest);

        return ResponseEntity.ok(Map.of(
                "orderId", order.get("id").toString(),
                "amount", amountInPaise,
                "currency", "INR",
                "keyId", razorpayKeyId   // public key — safe to send to frontend
        ));
    }

    // ── Step 2: Verify payment signature after checkout completes ──
    // This is CRITICAL — without this, anyone could fake a "successful" payment
    @PostMapping("/verify")
    public ResponseEntity<Map<String, Object>> verifyPayment(@RequestBody Map<String, String> body) {
        try {
            String orderId   = body.get("razorpay_order_id");
            String paymentId = body.get("razorpay_payment_id");
            String signature = body.get("razorpay_signature");

            JSONObject options = new JSONObject();
            options.put("razorpay_order_id", orderId);
            options.put("razorpay_payment_id", paymentId);
            options.put("razorpay_signature", signature);

            boolean isValid = Utils.verifyPaymentSignature(options, razorpayKeySecret);

            if (isValid) {
                return ResponseEntity.ok(Map.of("verified", true, "paymentId", paymentId));
            } else {
                return ResponseEntity.badRequest().body(Map.of("verified", false, "message", "Invalid signature"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("verified", false, "message", e.getMessage()));
        }
    }
}