package com.travelnest.backend.repository;

import com.travelnest.backend.entity.Package;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PackageRepository extends JpaRepository<Package, Long> {
    List<Package> findByCategory(String category);
    List<Package> findByTitleContainingIgnoreCase(String title);
}