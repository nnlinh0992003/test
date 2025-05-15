package com.example.infrastructure_service.client;

import com.example.infrastructure_service.dto.LocationPoint;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.minio.GetObjectArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
@Slf4j
public class MinioService {

  private final RedisTemplate<String, String> redisTemplate;

  private final MinioClient minioClient;
  @Value("${minio-domain}")
  private String minioDomain;

  public String uploadFile(MultipartFile file, String bucketName, String fileName) {

    try {
      try(InputStream inputStream = file.getInputStream()){
        minioClient.putObject(
            PutObjectArgs.builder()
                .bucket(bucketName)
                .object(fileName)
                .stream(inputStream, file.getSize(), -1)
                .contentType(file.getContentType())
                .build()
        );
      }

      return minioDomain + "/" + bucketName + "/" + fileName;

    }catch (Exception e) {
      throw new RuntimeException("Error uploading file to MinIO", e);
    }
  }



  public List<LocationPoint> readGpsFile(String gpsUrl) {
    String[] parts = gpsUrl.split("/");
    int len = parts.length;
    String bucket = parts[len - 2];
    String fileName = parts[len - 1];
    String cacheKey = "gps:" + bucket + ":" + fileName;

    // Check cache first
    String cachedData = redisTemplate.opsForValue().get(cacheKey);
    if (cachedData != null) {
      try {
        ObjectMapper mapper = new ObjectMapper();
        return mapper.readValue(cachedData,
            mapper.getTypeFactory().constructCollectionType(List.class, LocationPoint.class));
      } catch (Exception e) {
        e.printStackTrace();
      }
    }

    log.info("readGpsFile from MinIO: bucket={}, fileName={}", bucket, fileName);

    GetObjectArgs args = GetObjectArgs.builder()
        .bucket(bucket)
        .object(fileName)
        .build();

    try (InputStream stream = minioClient.getObject(args)) {
      ObjectMapper mapper = new ObjectMapper();
      List<LocationPoint> points = mapper.readValue(stream,
          mapper.getTypeFactory().constructCollectionType(List.class, LocationPoint.class));

      // Save to Redis as JSON
      redisTemplate.opsForValue().set(cacheKey, mapper.writeValueAsString(points));

      return points;
    } catch (Exception e) {
      e.printStackTrace();
    }

    return null;
  }

}
