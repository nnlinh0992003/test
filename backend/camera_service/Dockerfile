# Build stage
FROM maven:3.9-eclipse-temurin-21-alpine AS build
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Run stage
FROM eclipse-temurin:21-jre-alpine
COPY --from=build /target/*.jar app.jar

# Create uploads directory with proper permissions
RUN mkdir -p uploads && chmod 777 uploads

# Add non-root user for security
RUN addgroup -S spring && adduser -S spring -G spring
# Give spring user ownership of the uploads directory
RUN chown -R spring:spring /uploads
USER spring:spring

EXPOSE 8082
ENTRYPOINT ["java", "-jar", "/app.jar"]