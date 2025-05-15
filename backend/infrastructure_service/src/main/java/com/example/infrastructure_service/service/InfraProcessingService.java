package com.example.infrastructure_service.service;

import com.example.infrastructure_service.client.MapClient;
import com.example.infrastructure_service.dto.request.AcceptProcessRequest;
import com.example.infrastructure_service.dto.request.RejectProcessRequest;
import com.example.infrastructure_service.enums.ProcessStatus;
import com.example.infrastructure_service.enums.TicketStatus;
import com.example.infrastructure_service.model.Event;
import com.example.infrastructure_service.enums.EventStatus;
import com.example.infrastructure_service.model.InfraInfo;
import com.example.infrastructure_service.model.InfraObject;
import com.example.infrastructure_service.model.InfraObjectProcess;
import com.example.infrastructure_service.model.ProcessTicket;
import com.example.infrastructure_service.repository.EventRepository;
import com.example.infrastructure_service.repository.InfraObjectProcessRepository;
import com.example.infrastructure_service.repository.InfraObjectRepository;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.PrecisionModel;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class InfraProcessingService {

  private final InfraObjectRepository infraObjectRepository;
  private final EventRepository eventRepository;
  private final MapClient mapClient;
  private final EventService eventService;
  private final HistoryService historyService;
  private final InfraObjectProcessRepository infraObjectProcessRepository;
  GeometryFactory geometryFactory = new GeometryFactory(new PrecisionModel(), 4326);

  protected void processOneInfraObject(InfraObjectProcess item, AcceptProcessRequest request) {
    InfraObject existedInfra = item.getInfraObject();
    Event event;
    if (item.getEventStatus() == EventStatus.NEW) {
      // save infra if not exist and create new event

      InfraObject infraObject = InfraObject.builder()
          .cameraId(item.getCameraId())
          .dateCaptured(item.getDateCaptured())
          .latitude(item.getLatitude())
          .longitude(item.getLongitude())
          .category(item.getCategory())
          .name((request.getName() != null && !request.getName().isEmpty()) ? request.getName() : item.getName())
          .status(item.getStatus())
          .confidence(item.getConfidence())
          .level(item.getLevel())
          .scheduleId(item.getScheduleId())
          .bbox(item.getBbox())
          .realWidth(item.getRealWidth())
          .realHeight(item.getRealHeight())
          .isUpdated(true)
          .type(item.getType())
          .location(mapClient.getAddress(item.getLatitude(), item.getLongitude()))
          .image(item.getImage())
          .geography(geometryFactory.createPoint(new Coordinate(item.getLongitude(), item.getLatitude())))
          .build();

      InfraInfo infraInfo = new InfraInfo();
      infraInfo.setCreateAt(LocalDateTime.now());
      infraInfo.setKeyId(item.getKeyId());
      infraInfo.setManageUnit(request.getManageUnit());
      infraInfo.setAdditionalData(request.getAdditionalData());
      infraObject.setInfo(infraInfo);
      InfraObject saveInfraObject = infraObjectRepository.save(infraObject);

      historyService.saveHistoryInfra(saveInfraObject);
      event = eventService.createEvent(saveInfraObject, false, EventStatus.NEW);
      ProcessTicket processTicket = ProcessTicket.builder()
          .title(request.getTitle())
          .createdAt(LocalDateTime.now())
          .description(request.getDescription())
          .assignedTo(request.getAssignedTo())
          .level(request.getLevel())
          .ticketStatus(TicketStatus.NEW)
          .build();
      event.setEventTicket(processTicket);
      item.setProcessTicket(processTicket);
      eventRepository.save(event);
    }else {

      Event lastEvent = eventRepository.findTheLastEvent(existedInfra.getId());

      // neu nhu dang co su kien sua chua thi ko cap that vao
      if(lastEvent.getEventStatus().equals(EventStatus.REPAIR.toString()) && lastEvent.getEndTime() == null) {
        return;
      }

      //check different status
      boolean differentStatus = !existedInfra.getStatus().equals(item.getStatus());

      //update infra object new Image and status
      existedInfra.setScheduleId(item.getScheduleId());
      existedInfra.setStatus(item.getStatus());
      existedInfra.setName(item.getName());
      existedInfra.setImage(item.getImage());
      existedInfra.setDateCaptured(item.getDateCaptured());
      InfraObject saveExistInfra = infraObjectRepository.save(existedInfra);

      historyService.saveHistoryInfra(saveExistInfra);

      // set end time for event and create new event have new status
      if(differentStatus ){

        eventService.updateLastEvent(existedInfra.getId(), item.getDateCaptured());

        event = eventService.createEvent(saveExistInfra, false, item.getEventStatus());
        ProcessTicket processTicket = ProcessTicket.builder()
            .title(request.getTitle())
            .createdAt(LocalDateTime.now())
            .description(request.getDescription())
            .assignedTo(request.getAssignedTo())
            .level(request.getLevel())
            .ticketStatus(TicketStatus.NEW)
            .build();
        event.setEventTicket(processTicket);
        item.setProcessTicket(processTicket);
        eventRepository.save(event);
      }else{

        ProcessTicket processTicket = lastEvent.getEventTicket();
        processTicket.setTicketStatus(TicketStatus.UPDATED);
        processTicket.setUpdatedAt(LocalDateTime.now());
        lastEvent.setEventTicket(processTicket);
        item.setProcessTicket(processTicket);
        eventRepository.save(lastEvent);

      }

    }
    infraObjectProcessRepository.save(item);
  }


  // find the nearest infra object around radius 50m
  public InfraObject findByLocation(String cameraId, String category, String name, Double latitude,
      Double longitude) {
    return infraObjectRepository.findNearestInfraWithinRadius(cameraId, category, name, latitude,
        longitude, 5.0);
  }

  public List<InfraObjectProcess> getInfraObjectProcessFilterBySchedule(String scheduleId, String status, String processStatus, String eventStatus, String type, String category) {
    return infraObjectProcessRepository.filterInfraProcess(scheduleId, status, processStatus, eventStatus, type, category);
  }

  public List<InfraObjectProcess> getAllProcessBySchedule(String scheduleId) {
    return infraObjectProcessRepository.findByScheduleId(scheduleId);
  }

  public InfraObjectProcess acceptProcess(AcceptProcessRequest request) {
    InfraObjectProcess infraObjectProcess = infraObjectProcessRepository.findById(request.getInfraProcessId()).orElseThrow(()-> new RuntimeException("infra object process not found"));
    if(infraObjectProcess.getProcessStatus() != ProcessStatus.PENDING) {
      throw new RuntimeException("infra object process is not pending");
    }
    processOneInfraObject(infraObjectProcess, request);
    infraObjectProcess.setProcessStatus(ProcessStatus.APPROVED);
    return infraObjectProcessRepository.save(infraObjectProcess);
  }

  public InfraObjectProcess rejectProcess(RejectProcessRequest request) {
    InfraObjectProcess infraObjectProcess = infraObjectProcessRepository.findById(request.getInfraProcessId()).orElseThrow(()-> new RuntimeException("infra object process not found"));
    if(infraObjectProcess.getProcessStatus() != ProcessStatus.PENDING) {
      throw new RuntimeException("infra object process is not pending");
    }

    ProcessTicket processTicket = ProcessTicket.builder()
        .title(request.getTitle())
        .createdAt(LocalDateTime.now())
        .description(request.getDescription())
        .ticketStatus(TicketStatus.RESOLVED)
        .build();
    infraObjectProcess.setProcessTicket(processTicket);
    infraObjectProcess.setProcessStatus(ProcessStatus.REJECTED);

    return infraObjectProcessRepository.save(infraObjectProcess);
  }

//  public List<InfraObjectProcess> processAllInfraBySchedule(String scheduleId) {
//    List<InfraObjectProcess> infraObjectProcesses = infraObjectProcessRepository.findByScheduleIdAndProcessStatus(scheduleId, ProcessStatus.PENDING);
//    for (InfraObjectProcess infraObjectProcess : infraObjectProcesses) {
//      processOneInfraObject(infraObjectProcess);
//      infraObjectProcess.setProcessStatus(ProcessStatus.APPROVED);
//    }
//    return infraObjectProcessRepository.saveAll(infraObjectProcesses);
//  }
}
