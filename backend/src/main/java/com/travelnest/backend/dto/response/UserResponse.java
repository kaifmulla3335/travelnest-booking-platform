package com.travelnest.backend.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class UserResponse {
    private Long   id;
    private String name;
    private String email;
    private String phone;
    private String role;
    private String profileImage;
    private LocalDateTime createdAt;
}