package com.example.camera_service.dto;

import com.example.camera_service.utils.SchedulingStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SchedulingDTO {
    private String id;
    private String startTime;
    private String endTime;
    private SchedulingStatus schedulingStatus;
    private String cameraId;
    private String videoUrl;
    private String gpsLogsUrl;
    private String videoDetectUrl;
    private String deviceCode;
    private String vehicle;
    private String driver;
    private String route;

    public SchedulingDTO(String startTime, String endTime, String cameraId, String videoUrl, String gpsLogsUrl, String deviceCode, String vehicle, String driver, String route) {
        this.startTime = startTime;
        this.endTime = endTime;
        this.cameraId = cameraId;
        this.videoUrl = videoUrl;
        this.gpsLogsUrl = gpsLogsUrl;
        this.deviceCode = deviceCode;
        this.vehicle = vehicle;
        this.driver = driver;
        this.route = route;
    }
}
