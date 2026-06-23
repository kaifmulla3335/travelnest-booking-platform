package com.travelnest.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PackageResponse {
    private Long id;
    private String title;
    private String description;
    private Double price;
    private String location;
    private String duration;
    private String category;
    private String imageUrl;
    private Double rating;
    private Integer availableSlots;
    private LocalDate tourStartDate;
    private LocalDate tourEndDate;
    private LocalDate bookingDeadline;

}