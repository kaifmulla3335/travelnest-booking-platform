package com.travelnest.backend.repository;

import com.travelnest.backend.entity.Setting;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SettingRepository extends JpaRepository<Setting, Long> {
}