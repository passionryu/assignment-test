FROM gradle:8.10.2-jdk17 AS build
WORKDIR /app
COPY service/server/settings.gradle.kts service/server/build.gradle.kts ./
COPY service/server/src ./src
RUN gradle bootJar --no-daemon

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar", "--spring.profiles.active=local"]
