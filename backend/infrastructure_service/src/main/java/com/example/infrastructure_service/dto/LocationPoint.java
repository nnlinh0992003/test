package com.example.infrastructure_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
public class LocationPoint {
  private long timestamp;
  private double latitude;
  private double longitude;
  private double accuracy;
  private double speed;
  private double altitude;
  private double bearing;
}
