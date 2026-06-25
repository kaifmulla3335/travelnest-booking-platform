package com.travelnest.backend.controller;

import com.travelnest.backend.dto.request.ChangePasswordRequest;
import com.travelnest.backend.dto.request.UpdateProfileRequest;
import com.travelnest.backend.dto.response.UserResponse;
import com.travelnest.backend.entity.User;
import com.travelnest.backend.repository.UserRepository;
import com.travelnest.backend.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final CloudinaryService cloudinaryService;

    // ── Get my profile ────────────────────────────────
    @GetMapping("/api/user/profile")
    public ResponseEntity<UserResponse> getMyProfile(
            @AuthenticationPrincipal String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(toResponse(user));
    }

    // ── Update name + phone + profile image ───────────
    @PutMapping("/api/user/profile")
    public ResponseEntity<UserResponse> updateProfile(
            @AuthenticationPrincipal String email,
            @RequestBody UpdateProfileRequest request) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName().trim());
        }

        if (request.getPhone() != null) {
            user.setPhone(request.getPhone().trim());
        }

        if (request.getProfileImage() != null) {
            user.setProfileImage(request.getProfileImage());
        }

        userRepository.save(user);

        return ResponseEntity.ok(toResponse(user));
    }

    // ── Upload Avatar (Cloudinary) ────────────────────
    @PostMapping("/api/user/upload-avatar")
    public ResponseEntity<Map<String, String>> uploadAvatar(
            @AuthenticationPrincipal String email,
            @RequestParam("file") MultipartFile file) throws IOException {

        String imageUrl = cloudinaryService.upload(file, "avatars");

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setProfileImage(imageUrl);
        userRepository.save(user);

        return ResponseEntity.ok(Map.of(
                "imageUrl", imageUrl
        ));
    }

    // ── Change Password ───────────────────────────────
    @PutMapping("/api/user/change-password")
    public ResponseEntity<Map<String, String>> changePassword(
            @AuthenticationPrincipal String email,
            @RequestBody ChangePasswordRequest request) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Current password is incorrect"));
        }

        if (request.getNewPassword().length() < 6) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Password must be at least 6 characters"));
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        return ResponseEntity.ok(Map.of(
                "message", "Password changed successfully"
        ));
    }

    // ── Admin: Get All Users ──────────────────────────
    @GetMapping("/api/admin/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserResponse>> getAllUsers() {

        return ResponseEntity.ok(
                userRepository.findAll()
                        .stream()
                        .map(this::toResponse)
                        .collect(Collectors.toList())
        );
    }

    // ── Entity → Response ─────────────────────────────
    private UserResponse toResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole().name())
                .profileImage(user.getProfileImage())
                .createdAt(user.getCreatedAt())
                .build();
    }
}