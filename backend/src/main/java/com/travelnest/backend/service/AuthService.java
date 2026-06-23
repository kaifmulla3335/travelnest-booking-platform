package com.travelnest.backend.service;

import com.travelnest.backend.dto.request.LoginRequest;
import com.travelnest.backend.dto.request.RegisterRequest;
import com.travelnest.backend.dto.response.AuthResponse;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
}