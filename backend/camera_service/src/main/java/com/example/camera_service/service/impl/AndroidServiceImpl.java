package com.example.camera_service.service.impl;

import com.example.camera_service.client.UploadClient;
import com.example.camera_service.dto.SchedulingDTO;
import com.example.camera_service.dto.request.AddDeviceRequest;
import com.example.camera_service.dto.request.UpdateSchedulingRequest;
import com.example.camera_service.dto.request.UpdateVideoSchedule;
import com.example.camera_service.entity.Camera;
import com.example.camera_service.entity.CameraUser;
import com.example.camera_service.entity.Scheduling;
import com.example.camera_service.repository.CameraRepository;
import com.example.camera_service.repository.CameraUserRepository;
import com.example.camera_service.repository.SchedulingRepository;
import com.example.camera_service.service.AndroidService;
import com.example.camera_service.service.SchedulingService;
import com.example.camera_service.utils.CameraStatus;
import com.example.camera_service.utils.SchedulingStatus;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AndroidServiceImpl implements AndroidService {

  @Value("${minio-domain}")
  private String minioDomain;

  private final MinioClient minioClient;
  private final SchedulingService schedulingService;
  private final UploadClient uploadClient;
  private final SchedulingRepository schedulingRepository;
  private final CameraRepository cameraRepository;
  private final CameraUserRepository cameraUserRepository;
  private static final String UPLOAD_DIR = "uploads/";
  private static final String BUCKET_NAME = "monitor-test";

  @Override
  public ResponseEntity<String> uploadVideoChunk(
      MultipartFile filePart, int chunkIndex, int totalChunks, String fileName, String scheduleId, String cameraId) {
    try {
      if (chunkIndex < 0 || totalChunks <= 0 || fileName.isEmpty()) {
        return ResponseEntity.badRequest().body("Invalid input data");
      }

      File uploadDir = new File(UPLOAD_DIR);
      if (!uploadDir.exists()) {
        uploadDir.mkdirs();
      }

      Path tempFilePath = Path.of(UPLOAD_DIR, fileName + ".part" + chunkIndex);
      try (InputStream inputStream = filePart.getInputStream()) {
        Files.copy(inputStream, tempFilePath, StandardCopyOption.REPLACE_EXISTING);
      }

      log.info("Video chunk {} uploaded successfully for file {}", chunkIndex, fileName);

      if (chunkIndex == totalChunks - 1) {
        log.info("Final video chunk received, merging file: {}", fileName);
        File finalFile = mergeChunks(fileName, totalChunks);
        log.info("Video file {} merged successfully, uploading to MinIO...", fileName);

        uploadToMinio(finalFile, BUCKET_NAME, fileName, "video/mp4");

        String pathVideo = minioDomain + "/monitor-test/" + fileName;

        Scheduling scheduling = schedulingService.updateVideo(new UpdateVideoSchedule(scheduleId, pathVideo));
        String responseUpload  = uploadClient.startProcessing(scheduling.getCamera().getId(), scheduling.getId(), scheduling.getVideoUrl(), scheduling.getGpsLogsUrl());
        scheduling.setSchedulingStatus(SchedulingStatus.RUNNING);
        schedulingRepository.save(scheduling);
        log.info("Response from upload client: {}", responseUpload);

        Files.deleteIfExists(finalFile.toPath());
        return ResponseEntity.ok("Video file uploaded successfully");
      }

      return ResponseEntity.ok("Video chunk " + chunkIndex + " uploaded successfully");

    } catch (Exception e) {
      log.error("Video upload failed: {}", e.getMessage(), e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Video upload failed: " + e.getMessage());
    }
  }


  @Override
  public ResponseEntity<String> uploadGpsFile(
      MultipartFile file, String fileName, String scheduleId, String cameraId, String startTime, String endTime) {
    try {
      if (fileName.isEmpty() || file.isEmpty()) {
        return ResponseEntity.badRequest().body("Invalid input data");
      }

      log.info("Uploading GPS file {} to MinIO...", fileName);
      try (InputStream inputStream = file.getInputStream()) {
        minioClient.putObject(
            PutObjectArgs.builder()
                .bucket(BUCKET_NAME)
                .object(fileName)
                .stream(inputStream, file.getSize(), -1)
                .contentType("application/json")
                .build()
        );
      }

      String pathGps = minioDomain + "/monitor-test/" + fileName;
      schedulingService.uploadSchedule(new UpdateSchedulingRequest(scheduleId, pathGps, null, cameraId, startTime, endTime));
      log.info("GPS file {} uploaded to MinIO successfully", fileName);
      return ResponseEntity.ok("GPS file uploaded successfully");

    } catch (Exception e) {
      log.error("GPS upload failed: {}", e.getMessage(), e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("GPS upload failed: " + e.getMessage());
    }
  }


  @Override
  public ResponseEntity<String> startProcessing(String scheduleId) {
    Scheduling scheduling = schedulingRepository.findById(scheduleId)
        .orElseThrow(() -> new RuntimeException("Scheduling not found with id: " + scheduleId));
    String responseUpload  = uploadClient.startProcessing(scheduling.getCamera().getId(), scheduling.getId(), scheduling.getVideoUrl(), scheduling.getGpsLogsUrl());
    log.info("start processing with scheduleId {}", scheduleId);
    return ResponseEntity.ok(responseUpload);
  }

  @Override
  public ResponseEntity<Boolean> checkExistSchedule(String scheduleId) {
    Scheduling scheduling = schedulingRepository.findById(scheduleId).orElse(null);
    if(scheduling!= null && scheduling.getVideoUrl() != null && scheduling.getGpsLogsUrl() != null) {
      return ResponseEntity.ok(true);
    }
    return ResponseEntity.badRequest().body(false);
  }

  @Override
  public ResponseEntity<String> addDevice(AddDeviceRequest request, String credentialId) {

    Camera existingCamera = cameraRepository.findById(request.getId()).orElse(null);
    if (existingCamera != null) {
      return ResponseEntity.badRequest().body("Device already exists");
    }

    Camera camera = new Camera();
    camera.setId(request.getId());
    camera.setName(request.getName());
    camera.setCameraStatus(CameraStatus.ACTIVE);
    Camera savedCamera = cameraRepository.save(camera);
    CameraUser cameraUser = new CameraUser();
    cameraUser.setCamera(savedCamera);
    cameraUser.setUserId(credentialId);
    cameraUserRepository.save(cameraUser);
    return ResponseEntity.ok("Successfully added device");
  }

  private File mergeChunks(String fileName, int totalChunks) throws IOException {
    File mergedFile = new File(UPLOAD_DIR + fileName);
    try (FileOutputStream fos = new FileOutputStream(mergedFile)) {
      for (int i = 0; i < totalChunks; i++) {
        Path chunkPath = Path.of(UPLOAD_DIR, fileName + ".part" + i);
        if (!Files.exists(chunkPath)) {
          throw new FileNotFoundException("Missing chunk: " + i);
        }
        Files.copy(chunkPath, fos);
        Files.delete(chunkPath);
      }
    }
    return mergedFile;
  }

  private void uploadToMinio(File file, String bucketName, String objectName, String contentType) throws Exception {
    try (InputStream is = Files.newInputStream(file.toPath())) {
      minioClient.putObject(
          PutObjectArgs.builder()
              .bucket(bucketName)
              .object(objectName)
              .stream(is, file.length(), -1)
              .contentType(contentType)
              .build()
      );
      log.info("File {} uploaded to MinIO bucket {} successfully", objectName, bucketName);
    }
  }
}