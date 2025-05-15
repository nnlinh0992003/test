package com.example.infrastructure_service.controller;

import com.example.infrastructure_service.client.MinioService;
import com.example.infrastructure_service.dto.ApiResponse;
import com.example.infrastructure_service.dto.request.EndProcessRequest;
import com.example.infrastructure_service.service.ScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/infrastructures")
public class ScheduleController {

  private final ScheduleService scheduleService;
  private final MinioService minioService;

  @PostMapping("/public/schedule/end")
  public ApiResponse<String> processEnd(@RequestBody EndProcessRequest request) {

    scheduleService.endProcessSchedule(request);

    return ApiResponse.<String>builder()
        .message("Process end successfully, create log and save to minio")
        .data("Process successfully")
        .build();
  }

  @PostMapping("/schedule/start")
  public ApiResponse<String> processStart(@RequestParam String scheduleId) {
    return ApiResponse.<String>builder()
        .message("Process start successfully")
        .data("Process successfully")
        .build();
  }

//  @GetMapping({"/gps"})
//  public ApiResponse<List<LocationPoint>> readGpsFile(@RequestParam String gpsUrl) {
//    return ApiResponse.<List<LocationPoint>>builder()
//        .message("GPS file read successfully")
//        .data(minioService.readGpsFile(gpsUrl))
//        .build();
//  }

//  @GetMapping({"/infra/all"})
//  public ApiResponse<List<UndetectedInfra>> getUndetectedInfraObjectWithRoute(@RequestParam String scheduleId) {
//    return ApiResponse.<List<UndetectedInfra>>builder()
//        .message("GPS file read successfully")
//        .data(scheduleService.getUndetectedInfraObjectWithRoute(scheduleId))
//        .build();
//  }

}
