package com.example.infrastructure_service.controller;

import com.example.infrastructure_service.dto.ApiResponse;
import com.example.infrastructure_service.dto.request.AcceptProcessRequest;
import com.example.infrastructure_service.dto.request.RejectProcessRequest;
import com.example.infrastructure_service.model.InfraObjectProcess;
import com.example.infrastructure_service.service.InfraProcessingService;
import com.example.infrastructure_service.service.ScheduleService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/infrastructures/process")
@RequiredArgsConstructor
public class ProcessController {

  private final InfraProcessingService infraProcessingService;
  private final ScheduleService scheduleService;

  @PostMapping("/accept")
  public ApiResponse<InfraObjectProcess> processInfraObjectProcess(@RequestBody AcceptProcessRequest request) {
    return ApiResponse.<InfraObjectProcess>builder()
        .message("Process infra object process successfully with id: " + request.getInfraProcessId())
        .data(infraProcessingService.acceptProcess(request))
        .build();
  }

  @GetMapping({"/schedule"})
  public ApiResponse<List<InfraObjectProcess>> getAllProcessBySchedule(
      @RequestParam String scheduleId, @RequestParam(required = false) String status,
      @RequestParam(required = false) String processStatus,
      @RequestParam(required = false) String eventStatus,
      @RequestParam(required = false) String type, @RequestParam(required = false) String startDate,
      @RequestParam(required = false) String category) {
    return ApiResponse.<List<InfraObjectProcess>>builder()
        .message("Get all process by schedule successfully")
        .data(infraProcessingService.getInfraObjectProcessFilterBySchedule(scheduleId, status,
            processStatus, eventStatus, type, category))
        .build();
  }

  @GetMapping({"/schedule/{scheduleId}"})
  public ApiResponse<List<InfraObjectProcess>> getAllProcessBySchedule(
      @PathVariable String scheduleId) {
    return ApiResponse.<List<InfraObjectProcess>>builder()
        .message("Get all process by schedule successfully")
        .data(infraProcessingService.getAllProcessBySchedule(scheduleId))
        .build();
  }

  @PatchMapping({"/reject"})
  public ApiResponse<InfraObjectProcess> rejectProcess(@RequestBody RejectProcessRequest request) {
    return ApiResponse.<InfraObjectProcess>builder()
        .message("Reject process successfully")
        .data(infraProcessingService.rejectProcess(request))
        .build();
  }

//  @PostMapping("/schedule/{scheduleId}")
//  public ApiResponse<List<InfraObjectProcess>> processAllInfraBySchedule(
//      @PathVariable String scheduleId) {
//    return ApiResponse.<List<InfraObjectProcess>>builder()
//        .message("Process infra object process successfully with id: " + scheduleId)
//        .data(infraProcessingService.processAllInfraBySchedule(scheduleId))
//        .build();
//  }


}
