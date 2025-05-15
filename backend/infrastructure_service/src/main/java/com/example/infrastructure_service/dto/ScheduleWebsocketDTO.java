package com.example.infrastructure_service.dto;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;

@Data
@Builder
public class ScheduleWebsocketDTO {
  private String scheduleId;
  private String status;
  private LocalDateTime time;
}
