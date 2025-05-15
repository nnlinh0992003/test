package com.example.infrastructure_service.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class NotificationScheduleDTO {
  private String scheduleId;
  private String status;
  private String type;
  private String cameraId;
  private String startTime;
  private String endTime;
}
