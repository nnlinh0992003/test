package com.example.infrastructure_service.service;

import com.example.infrastructure_service.client.CameraClient;
import com.example.infrastructure_service.client.MinioService;
import com.example.infrastructure_service.client.RedisService;
import com.example.infrastructure_service.dto.LocationPoint;
import com.example.infrastructure_service.dto.ScheduleWebsocketDTO;
import com.example.infrastructure_service.dto.SchedulingDTO;
import com.example.infrastructure_service.dto.request.EndProcessRequest;
import com.example.infrastructure_service.enums.EventStatus;
import com.example.infrastructure_service.enums.ProcessStatus;
import com.example.infrastructure_service.model.InfraObject;
import com.example.infrastructure_service.model.InfraObjectProcess;
import com.example.infrastructure_service.repository.InfraObjectProcessRepository;
import com.example.infrastructure_service.repository.InfraObjectRepository;
import com.example.infrastructure_service.utils.LocationIndex;
import com.example.infrastructure_service.utils.Utils;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class ScheduleService {

  private final InfraObjectRepository infraObjectRepository;
  private final InfraObjectProcessRepository infraObjectProcessRepository;
  private final CameraClient cameraClient;
  private final NotificationService notificationService;
  private final MinioService minioService;
  private final RedisService redisService;
  private final WebSocketService webSocketService;
  private final ObjectMapper objectMapper;

  public void endProcessSchedule(EndProcessRequest request) {

    //update scheduling with url gps, video and update time
    SchedulingDTO schedulingDTO =  cameraClient.updateScheduling(request).getData();

    List<InfraObjectProcess> undetectedInfras = getUndetectedInfraObjectWithRoute(request.getScheduleId());
    infraObjectProcessRepository.saveAll(undetectedInfras);

    redisService.deleteScheduleId(request.getScheduleId());
//     send notification firebase
    notificationService.createScheduleNotification(schedulingDTO);

    ScheduleWebsocketDTO scheduleWebsocketDTO = ScheduleWebsocketDTO.builder()
        .scheduleId(request.getScheduleId())
        .status("done")
        .time(LocalDateTime.now())
        .build();

    try {
      String destination = "/topic/scheduling/" + schedulingDTO.getId();

      webSocketService.sendMessage(destination, objectMapper.writeValueAsString(scheduleWebsocketDTO));
      log.info("Send end schedule message to websocket: {}", scheduleWebsocketDTO);
    }catch (Exception e){
      log.error("Error when send message to websocket: {}", e.getMessage());
    }
  }


  public List<InfraObjectProcess> getUndetectedInfraObjectWithRoute(String scheduleId) {

    SchedulingDTO schedulingDTO = cameraClient.getSchedulingById(scheduleId).getData();

    // read gps file from minio and convert to list of LocationPoint
    List<LocationPoint> locationPoints = minioService.readGpsFile(schedulingDTO.getGpsLogsUrl());

    // build line from point, find infra object near the line
    String linestringWKT = Utils.buildLinestringWKT(locationPoints);
    List<InfraObject> infraObjects =  infraObjectRepository.findObjectsNearRoute(linestringWKT, 5.0);

    // get all infra objects that have been detected with schedule
    List<InfraObject> detectedInfraObjects = infraObjectProcessRepository.findByScheduleId(scheduleId).stream().map(
        InfraObjectProcess::getInfraObject).toList();

    List<InfraObject> undetectedInfraObjects = infraObjects.stream()
        .filter(infraObject -> !detectedInfraObjects.contains(infraObject))
        .toList();

    //build tree from location points
    LocationIndex index = new LocationIndex(locationPoints);

    // find nearest point for each infra object and return undetected object and point
    return undetectedInfraObjects.stream().map(infraObject -> {
      LocationPoint locationPoint = index.findNearest(infraObject.getLatitude(), infraObject.getLongitude());
      return InfraObjectProcess.builder()
          .cameraId(schedulingDTO.getCameraId())
          .scheduleId(scheduleId)
          .infraObject(infraObject)
          .processStatus(ProcessStatus.PENDING)
          .status("LOST")
          .keyId(infraObject.getInfo().getKeyId())
          .eventStatus(EventStatus.LOST)
          .category(infraObject.getCategory())
          .name(infraObject.getName())
          .dateCaptured(LocalDateTime.ofInstant(
              Instant.ofEpochMilli(locationPoint.getTimestamp()),
              ZoneId.of("Asia/Ho_Chi_Minh")
          ))
          .level(2)
          .latitude(infraObject.getLatitude())
          .longitude(infraObject.getLongitude())
          .type(infraObject.getType())
          .location(infraObject.getLocation())
          .build();
    }).collect(Collectors.toList());
  }


}
