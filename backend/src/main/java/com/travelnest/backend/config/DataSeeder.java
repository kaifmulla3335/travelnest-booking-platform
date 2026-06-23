package com.travelnest.backend.config;

import com.travelnest.backend.entity.Package;
import com.travelnest.backend.entity.User;
import com.travelnest.backend.repository.PackageRepository;
import com.travelnest.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final PackageRepository packageRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {

        // Seed admin user
        if (!userRepository.existsByEmail("admin@travelnest.in")) {
            userRepository.save(User.builder()
                    .name("Admin User")
                    .email("admin@travelnest.in")
                    .password(passwordEncoder.encode("admin123"))
                    .role(User.Role.ADMIN)
                    .phone("+91 98000 00000")
                    .build());
            System.out.println("✅ Admin user seeded");
        }

        // Seed packages
        if (packageRepository.count() == 0) {
            packageRepository.save(Package.builder()
                    .title("Goa Beach Getaway")
                    .description("Relax on pristine white sand beaches with crystal-clear waters.")
                    .price(18999.0)
                    .location("Goa, India")
                    .duration("5 Days / 4 Nights")
                    .category("Beach")
                    .rating(4.8)
                    .availableSlots(20)
                    .build());

            packageRepository.save(Package.builder()
                    .title("Ladakh Adventure Trek")
                    .description("Experience the magic of the Himalayas with breathtaking passes.")
                    .price(28000.0)
                    .location("Ladakh, India")
                    .duration("8 Days / 7 Nights")
                    .category("Adventure")
                    .rating(4.9)
                    .availableSlots(12)
                    .build());

            packageRepository.save(Package.builder()
                    .title("Kerala Backwaters Bliss")
                    .description("Float through serene backwaters on a traditional houseboat.")
                    .price(24500.0)
                    .location("Kerala, India")
                    .duration("6 Days / 5 Nights")
                    .category("Cultural")
                    .rating(4.7)
                    .availableSlots(15)
                    .build());

            System.out.println("✅ Sample packages seeded");
        }
    }
}