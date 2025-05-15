package com.example.infrastructure_service.service;

import com.example.infrastructure_service.dto.EventNotificationDTO;
import com.example.infrastructure_service.dto.NotificationDTO;
import com.example.infrastructure_service.dto.NotificationScheduleDTO;
import com.example.infrastructure_service.dto.SchedulingDTO;
import com.example.infrastructure_service.kafka.MessageProducer;
import com.example.infrastructure_service.mapper.EventMapper;
import com.example.infrastructure_service.model.Event;
import com.example.infrastructure_service.enums.EventStatus;
import com.example.infrastructure_service.utils.Utils;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.format.DateTimeFormatter;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.actuate.startup.StartupEndpoint;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NotificationService {

  private final ObjectMapper objectMapper;
  private final MessageProducer messageProducer;
  private final EventMapper eventMapper;

  public void createEventNotification(Event event, EventStatus status) {
    try{

      EventNotificationDTO eventNotificationDTO = eventMapper.toEventNotificationDTO(event);
      String data = objectMapper.writeValueAsString(eventNotificationDTO);

      NotificationDTO notificationDTO = NotificationDTO.builder()
          .subject("Event" + status)
          .content("Alarm Notification with " + event.getInfraObject().getName() + " at " + event.getDateCaptured())
          .data(data)
          .build();

      messageProducer.sendDataToTopic("notification" ,objectMapper.writeValueAsString(notificationDTO));
    }catch (Exception e){
      e.printStackTrace();
    }
  }

  public void createScheduleNotification(SchedulingDTO schedulingDTO){
    try{
      NotificationScheduleDTO notificationScheduleDTO = NotificationScheduleDTO.builder()
          .scheduleId(schedulingDTO.getId())
          .type("END SCHEDULING")
          .cameraId(schedulingDTO.getCameraId())
          .startTime(schedulingDTO.getStartTime())
          .endTime(schedulingDTO.getEndTime())
          .status("DONE")
          .build();

      String data = objectMapper.writeValueAsString(notificationScheduleDTO);
      String title = "AI Processing Schedule Completed";
      String description = "The scanning task was scheduled to run from " + Utils.getStartHour(schedulingDTO.getStartTime()) + " to " + Utils.getStartHour(schedulingDTO.getEndTime()) + "on" + Utils.getDate(schedulingDTO.getEndTime())  + " and has been successfully completed by the AI system.";

      NotificationDTO notificationDTO = NotificationDTO.builder()
          .subject(title)
          .content(description)
          .data(data)
          .build();

      messageProducer.sendDataToTopic("notification",objectMapper.writeValueAsString(notificationDTO));
    }catch (Exception e){
      e.printStackTrace();
    }
  }


}
