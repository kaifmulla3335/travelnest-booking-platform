package com.travelnest.backend.repository;

import com.travelnest.backend.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUserEmailOrderByCreatedAtDesc(String email);
    List<Booking> findAllByOrderByCreatedAtDesc();
    Optional<Booking> findByVerificationToken(String token);
}