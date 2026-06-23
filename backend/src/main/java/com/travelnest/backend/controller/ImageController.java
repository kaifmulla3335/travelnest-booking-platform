package com.travelnest.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class ImageController {

    @Value("${app.upload.dir:uploads/packages}")
    private String uploadDir;

    @PostMapping("/upload-image")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> uploadImage(
            @RequestParam("file") MultipartFile file) throws IOException {

        // Create upload directory if not exists
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Unique filename
        String ext      = getExtension(file.getOriginalFilename());
        String filename = UUID.randomUUID() + "." + ext;
        Path   filePath = uploadPath.resolve(filename);

        Files.copy(file.getInputStream(), filePath,
                StandardCopyOption.REPLACE_EXISTING);

        // Return URL that frontend can use
        String imageUrl = "/uploads/packages/" + filename;
        return ResponseEntity.ok(Map.of("imageUrl", imageUrl));
    }

    private String getExtension(String filename) {
        if (filename == null) return "jpg";
        int dot = filename.lastIndexOf('.');
        return dot > 0 ? filename.substring(dot + 1).toLowerCase() : "jpg";
    }
}