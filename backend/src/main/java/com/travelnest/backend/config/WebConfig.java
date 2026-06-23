package com.travelnest.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.*;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Serve files from uploads/ folder at /uploads/** URL
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:uploads/");
    }
}