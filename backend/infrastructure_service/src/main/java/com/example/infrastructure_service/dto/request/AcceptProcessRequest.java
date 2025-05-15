package com.example.infrastructure_service.dto.request;

import com.example.infrastructure_service.enums.TicketStatus;
import lombok.Data;

@Data
public class AcceptProcessRequest {

  private String infraProcessId;
  private String title;
  private String description;

  // create info infra
  private String name;
  private String manageUnit;
  private String additionalData;

  //create process event infra
  private Integer level;
  private String assignedTo;

}
