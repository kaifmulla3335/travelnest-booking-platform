package com.travelnest.backend.service;

import com.travelnest.backend.dto.request.PackageRequest;
import com.travelnest.backend.dto.response.PackageResponse;
import java.util.List;

public interface PackageService {
    List<PackageResponse> getAllPackages();
    PackageResponse getPackageById(Long id);
    PackageResponse createPackage(PackageRequest request);
    PackageResponse updatePackage(Long id, PackageRequest request);
    void deletePackage(Long id);
}