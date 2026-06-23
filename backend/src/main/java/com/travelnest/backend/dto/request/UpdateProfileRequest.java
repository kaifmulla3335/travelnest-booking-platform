package com.travelnest.backend.dto.request;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String name;
    private String phone;
    private String profileImage;
}