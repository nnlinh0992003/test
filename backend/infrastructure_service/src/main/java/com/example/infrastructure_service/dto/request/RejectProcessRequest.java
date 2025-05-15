package com.example.infrastructure_service.dto.request;

import lombok.Data;

@Data
public class RejectProcessRequest {
  private String infraProcessId;
  private String title;
  private String description;
}
