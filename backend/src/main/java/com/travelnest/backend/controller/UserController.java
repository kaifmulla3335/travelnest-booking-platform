package com.travelnest.backend.controller;

import com.travelnest.backend.dto.request.UpdateProfileRequest;
import com.travelnest.backend.dto.request.ChangePasswordRequest;
import com.travelnest.backend.dto.response.UserResponse;
import com.travelnest.backend.entity.User;
import com.travelnest.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Value;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
public class UserController {

    private final UserRepository  userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.upload.dir:uploads/packages}")
    private String uploadDir;

    // ── Get my profile ────────────────────────────────
    @GetMapping("/api/user/profile")
    public ResponseEntity<UserResponse> getMyProfile(
            @AuthenticationPrincipal String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(toResponse(user));
    }

    // ── Update name + phone + profileImage URL ────────
    @PutMapping("/api/user/profile")
    public ResponseEntity<UserResponse> updateProfile(
            @AuthenticationPrincipal String email,
            @RequestBody UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getName() != null && !request.getName().isBlank())
            user.setName(request.getName().trim());
        if (request.getPhone() != null)
            user.setPhone(request.getPhone().trim());
        if (request.getProfileImage() != null)
            user.setProfileImage(request.getProfileImage());

        userRepository.save(user);
        return ResponseEntity.ok(toResponse(user));
    }

    // ── Upload profile image ──────────────────────────
    @PostMapping("/api/user/upload-avatar")
    public ResponseEntity<Map<String, String>> uploadAvatar(
            @AuthenticationPrincipal String email,
            @RequestParam("file") MultipartFile file) throws IOException {

        // Save to uploads/avatars/
        Path avatarDir = Paths.get("uploads/avatars");
        if (!Files.exists(avatarDir)) Files.createDirectories(avatarDir);

        String ext      = getExt(file.getOriginalFilename());
        String filename = UUID.randomUUID() + "." + ext;
        Files.copy(file.getInputStream(),
                avatarDir.resolve(filename),
                StandardCopyOption.REPLACE_EXISTING);

        String imageUrl = "http://localhost:8080/uploads/avatars/" + filename;

        // Save to DB
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setProfileImage(imageUrl);
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("imageUrl", imageUrl));
    }

    // ── Change password ───────────────────────────────
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
        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }

    // ── Admin: Get all users ──────────────────────────
    @GetMapping("/api/admin/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(
                userRepository.findAll().stream()
                        .map(this::toResponse)
                        .collect(Collectors.toList())
        );
    }

    private UserResponse toResponse(User u) {
        return UserResponse.builder()
                .id(u.getId())
                .name(u.getName())
                .email(u.getEmail())
                .phone(u.getPhone())
                .role(u.getRole().name())
                .profileImage(u.getProfileImage())
                .createdAt(u.getCreatedAt())
                .build();
    }

    private String getExt(String name) {
        if (name == null) return "jpg";
        int dot = name.lastIndexOf('.');
        return dot > 0 ? name.substring(dot + 1).toLowerCase() : "jpg";
    }
}