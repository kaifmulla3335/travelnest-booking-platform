package com.travelnest.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import java.time.LocalDate;

@Data
public class PackageRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotNull
    @Positive(message = "Price must be positive")
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