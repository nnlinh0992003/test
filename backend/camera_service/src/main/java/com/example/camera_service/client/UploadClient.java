package com.example.camera_service.client;

import com.example.camera_service.dto.request.StartProcessRequest;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
public class UploadClient {

  @Value("${ai-server}")
  private String aiServer;

  private final RestClient restClient;

  public String startProcessing(String cameraId, String scheduleId, String videoUrl, String gpsUrl){

    try {
      String response = restClient.post()
          .uri(aiServer + "/playback")
          .body(

              StartProcessRequest.builder()
                  .camera_id(cameraId)
                  .schedule_id(scheduleId)
                  .video_path(videoUrl)
                  .gps_path(gpsUrl)
                  .model_types(List.of("sign", "road"))
                  .camera_types(List.of("moving"))
                  .build()
          )
          .retrieve()
          .body(String.class);

      return response;
    }catch(Exception e){
      e.printStackTrace();
    }
    return null;
  }
}
