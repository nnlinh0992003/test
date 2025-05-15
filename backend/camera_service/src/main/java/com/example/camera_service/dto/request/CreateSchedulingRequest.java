package com.example.camera_service.dto.request;

import lombok.Data;

@Data
public class CreateSchedulingRequest {
    private String startTime;
    private String endTime;
    private String cameraId;
    private String deviceCode;
    private String vehicle;
    private String driver;
    private String route;
}
