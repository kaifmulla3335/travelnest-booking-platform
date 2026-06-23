package com.travelnest.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
import java.time.LocalDate;

@Entity
@Table(name = "packages")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Package {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private Double price;

    private String location;
    private String duration;
    private String category;
    private String imageUrl;
    private Double rating;
    private Integer availableSlots;

    @CreationTimestamp
    private LocalDateTime createdAt;


    private LocalDate tourStartDate;
    private LocalDate tourEndDate;
    private LocalDate bookingDeadline;
}