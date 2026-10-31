# One image: Spring Boot serves the API, the built React app and the covers.
# Tests don't run here (Testcontainers needs Docker); run ./mvnw verify and npm test before pushing.

# 1. Frontend
FROM node:24-slim AS frontend
WORKDIR /build/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build
# Covers stay in the repo-root public/images until cutover (Phase 7)
COPY public/images/ dist/images/

# 2. Backend jar with the frontend in static/
FROM eclipse-temurin:25-jdk AS backend
WORKDIR /build/backend
COPY backend/mvnw backend/pom.xml ./
COPY backend/.mvn/ .mvn/
RUN ./mvnw -B -q dependency:go-offline
COPY backend/src/ src/
COPY --from=frontend /build/frontend/dist/ src/main/resources/static/
RUN ./mvnw -B -q -DskipTests package && cp target/readers-club-*.jar /build/app.jar

# 3. Runtime
FROM eclipse-temurin:25-jre
RUN useradd --system --no-create-home app
USER app
WORKDIR /app
COPY --from=backend /build/app.jar app.jar
# Render Free: 512 MB for the whole container. PORT comes from Render.
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=70", "-XX:+UseSerialGC", "-Xss512k", "-XX:+ExitOnOutOfMemoryError", "-jar", "app.jar"]
