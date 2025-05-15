package com.example.camera_service.service;

import com.example.camera_service.dto.request.AddDeviceRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

public interface AndroidService {
  ResponseEntity<String> uploadVideoChunk(
      MultipartFile filePart, int chunkIndex, int totalChunks, String fileName, String scheduleId, String cameraId);

  ResponseEntity<String> uploadGpsFile(
      MultipartFile file, String fileName, String scheduleId, String cameraId, String startTime, String endTime);

  ResponseEntity<String> startProcessing(String scheduleId);

  ResponseEntity<Boolean> checkExistSchedule(String scheduleId);

  ResponseEntity<String> addDevice(AddDeviceRequest request, String credentialId);
}