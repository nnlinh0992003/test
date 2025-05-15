package com.example.infrastructure_service.dto;

import java.util.Map;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class RouteData {
  private String linestringWKT;
  private Map<String, Long> pointToTimeStamp;
}
