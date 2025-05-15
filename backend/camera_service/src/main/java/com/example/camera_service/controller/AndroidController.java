package com.example.camera_service.controller;

import com.example.camera_service.dto.request.AddDeviceRequest;
import com.example.camera_service.service.AndroidService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/cameras")
@RequiredArgsConstructor
public class AndroidController {

  private final AndroidService androidService;

  @PostMapping("/public/upload/video/chunk")
  public ResponseEntity<String> uploadVideoChunk(
      @RequestParam("filePart") MultipartFile filePart,
      @RequestParam("chunkIndex") int chunkIndex,
      @RequestParam("totalChunks") int totalChunks,
      @RequestParam("fileName") String fileName,
      @RequestParam("scheduleId") String scheduleId,
      @RequestParam("cameraId") String cameraId) {
    return androidService.uploadVideoChunk(filePart, chunkIndex, totalChunks, fileName, scheduleId, cameraId);
  }

  @PostMapping("/public/upload/gps")
  public ResponseEntity<String> uploadGpsFile(
      @RequestParam("file") MultipartFile file,
      @RequestParam("fileName") String fileName,
      @RequestParam("scheduleId") String scheduleId,
      @RequestParam("cameraId") String cameraId,
      @RequestParam("startTime") String startTime,
      @RequestParam("endTime") String endTime
  ) {
    return androidService.uploadGpsFile(file, fileName, scheduleId, cameraId, startTime, endTime);
  }

  @PostMapping("/public/process/{scheduleId}")
  public ResponseEntity<String> startProcessing(
      @PathVariable String scheduleId){
    return androidService.startProcessing(scheduleId);
  }

  @GetMapping("/public/schedule/{scheduleId}")
  public ResponseEntity<Boolean> checkExistSchedule(
      @PathVariable String scheduleId){
    return androidService.checkExistSchedule(scheduleId);
  }

  @PostMapping("/device")
  public ResponseEntity<String> addDevice(@RequestBody AddDeviceRequest request, @RequestHeader("X-Credential-Id") String credentialId) {
    return androidService.addDevice(request, credentialId);
  }

}