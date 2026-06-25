# ── Stage 1: Build the jar using Maven ──
FROM eclipse-temurin:17-jdk-jammy AS build
WORKDIR /app

# Copy wrapper + pom first so dependencies are cached separately from source changes
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .
RUN chmod +x mvnw
RUN ./mvnw dependency:go-offline -B

COPY src src
RUN ./mvnw clean package -DskipTests -B

# ── Stage 2: Run the jar on a lightweight JRE image ──
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

# Render injects its own $PORT — application.properties already reads it via
# server.port=${PORT:8080}, so nothing extra needed here.
EXPOSE 8080

# -Xmx caps JVM heap so it fits Render's free-tier 512MB container without
# crashing under load (JVM + Spring Boot can otherwise exceed that easily).
ENTRYPOINT ["java", "-Xmx400m", "-jar", "app.jar"]