package com.travelnest.backend.service.impl;

import com.travelnest.backend.dto.request.PackageRequest;
import com.travelnest.backend.dto.response.PackageResponse;
import com.travelnest.backend.entity.Package;
import com.travelnest.backend.repository.PackageRepository;
import com.travelnest.backend.service.PackageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PackageServiceImpl implements PackageService {

    private final PackageRepository packageRepository;

    @Override
    public List<PackageResponse> getAllPackages() {
        return packageRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public PackageResponse getPackageById(Long id) {
        Package pkg = packageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Package not found with id: " + id));
        return toResponse(pkg);
    }

    @Override
    public PackageResponse createPackage(PackageRequest request) {
        Package pkg = Package.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .price(request.getPrice())
                .location(request.getLocation())
                .duration(request.getDuration())
                .category(request.getCategory())
                .imageUrl(request.getImageUrl())
                .rating(request.getRating())
                .availableSlots(request.getAvailableSlots())
                .tourStartDate(request.getTourStartDate())
                .tourEndDate(request.getTourEndDate())
                .bookingDeadline(request.getBookingDeadline())
                .build();

        return toResponse(packageRepository.save(pkg));
    }

    @Override
    public PackageResponse updatePackage(Long id, PackageRequest request) {
        Package pkg = packageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Package not found with id: " + id));

        pkg.setTitle(request.getTitle());
        pkg.setDescription(request.getDescription());
        pkg.setPrice(request.getPrice());
        pkg.setLocation(request.getLocation());
        pkg.setDuration(request.getDuration());
        pkg.setCategory(request.getCategory());
        pkg.setImageUrl(request.getImageUrl());
        pkg.setRating(request.getRating());
        pkg.setAvailableSlots(request.getAvailableSlots());
        pkg.setTourStartDate(request.getTourStartDate());
        pkg.setTourEndDate(request.getTourEndDate());
        pkg.setBookingDeadline(request.getBookingDeadline());

        return toResponse(packageRepository.save(pkg));
    }

    @Override
    public void deletePackage(Long id) {
        if (!packageRepository.existsById(id)) {
            throw new RuntimeException("Package not found with id: " + id);
        }
        packageRepository.deleteById(id);
    }

    // Entity → Response mapper
    private PackageResponse toResponse(Package pkg) {
        return PackageResponse.builder()
                .id(pkg.getId())
                .title(pkg.getTitle())
                .description(pkg.getDescription())
                .price(pkg.getPrice())
                .location(pkg.getLocation())
                .duration(pkg.getDuration())
                .category(pkg.getCategory())
                .imageUrl(pkg.getImageUrl())
                .rating(pkg.getRating())
                .availableSlots(pkg.getAvailableSlots())
                .tourStartDate(pkg.getTourStartDate())       // ← ADDED
                .tourEndDate(pkg.getTourEndDate())            // ← ADDED
                .bookingDeadline(pkg.getBookingDeadline())   // ← ADDED
                .build();
    }
}