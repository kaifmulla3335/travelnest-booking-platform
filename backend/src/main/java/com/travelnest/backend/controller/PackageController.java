package com.travelnest.backend.controller;

import com.travelnest.backend.dto.request.PackageRequest;
import com.travelnest.backend.dto.response.PackageResponse;
import com.travelnest.backend.service.PackageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class PackageController {

    private final PackageService packageService;

    // ── Public APIs ────────────────────────────────
    @GetMapping("/api/packages")
    public ResponseEntity<List<PackageResponse>> getAllPackages() {
        return ResponseEntity.ok(packageService.getAllPackages());
    }

    @GetMapping("/api/packages/{id}")
    public ResponseEntity<PackageResponse> getPackageById(@PathVariable Long id) {
        return ResponseEntity.ok(packageService.getPackageById(id));
    }

    // ── Admin only APIs ────────────────────────────
    @PostMapping("/api/admin/packages")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PackageResponse> createPackage(
            @Valid @RequestBody PackageRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(packageService.createPackage(request));
    }

    @PutMapping("/api/admin/packages/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PackageResponse> updatePackage(
            @PathVariable Long id,
            @Valid @RequestBody PackageRequest request) {
        return ResponseEntity.ok(packageService.updatePackage(id, request));
    }

    @DeleteMapping("/api/admin/packages/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deletePackage(@PathVariable Long id) {
        packageService.deletePackage(id);
        return ResponseEntity.noContent().build();
    }
}