package com.example.infrastructure_service.service;

import com.example.infrastructure_service.client.MapClient;
import com.example.infrastructure_service.client.RedisService;
import com.example.infrastructure_service.enums.EventStatus;
import com.example.infrastructure_service.enums.InfraType;
import com.example.infrastructure_service.enums.ProcessStatus;
import com.example.infrastructure_service.model.InfraImage;
import com.example.infrastructure_service.model.InfraObject;
import com.example.infrastructure_service.model.InfraObjectProcess;
import com.example.infrastructure_service.dto.JsonObject;
import com.example.infrastructure_service.dto.JsonObject.Annotation;
import com.example.infrastructure_service.dto.JsonObject.Category;
import com.example.infrastructure_service.dto.JsonObject.Image;
import com.example.infrastructure_service.repository.InfraObjectProcessRepository;
import com.example.infrastructure_service.utils.Utils;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@RequiredArgsConstructor
@Service
public class JsonToInfraObjectProcess {
  DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
  private final MapClient mapClient;
  private final InfraObjectProcessRepository infraObjectProcessRepository;
  private final InfraProcessingService infraProcessingService;
  private final InfraImageService infraImageService;
  private final RedisService redisService;
  private final WebSocketService webSocketService;
  private final ObjectMapper objectMapper;

  // parser from json from kafka to List infraObject
  public List<InfraObjectProcess> processParseObject(JsonObject jsonObject) {
    InfraObjectProcess saveProcess;
    List<InfraObjectProcess> infraObjectProcessList = new ArrayList<>();
    // Lặp qua từng annotation
    for (Annotation annotation : jsonObject.getAnnotations()) {

      // Lấy category tương ứng với annotation
      Category category = jsonObject.getCategories()
          .stream()
          .filter(cat -> cat.getId() == annotation.getCategoryId())
          .findFirst()
          .orElseThrow(() -> new RuntimeException(
              "No matching category found for annotation ID " + annotation.getId()));

      // Lấy image tương ứng với annotation
      Image image = jsonObject.getImages()
          .stream()
          .filter(img -> img.getId() == annotation.getImageId())
          .findFirst()
          .orElseThrow(() -> new RuntimeException(
              "No matching image found for annotation ID " + annotation.getImageId()));
      String keyID = ""+category.getSupercategory().charAt(0) + category.getName().charAt(0) + "-" + Utils.generateGeoHash(annotation.getLocation().getLatitude(),
          annotation.getLocation().getLongitude(), 9);

      if(redisService.checkKeyIdExists(jsonObject.getInfo().getScheduleId(), keyID)){
        continue;
      }

      InfraObjectProcess model = new InfraObjectProcess();

      // Set thông tin cơ bản
      model.setCameraId(jsonObject.getInfo().getCameraId());
      model.setScheduleId(jsonObject.getInfo().getScheduleId());
      model.setCategory(category.getSupercategory());
      model.setName(category.getName());
      model.setDateCaptured(LocalDateTime.parse(image.getDateCaptured(), formatter));
      model.setLongitude(annotation.getLocation().getLongitude());
      model.setLatitude(annotation.getLocation().getLatitude());
      model.setStatus(annotation.getStatus());
      model.setConfidence(annotation.getConf());
      model.setProcessStatus(ProcessStatus.PENDING);
      model.setBbox(Arrays.toString(annotation.getBbox()));
      model.setRealWidth(Math.floor(annotation.getRealWidth()));
      model.setRealHeight(Math.floor(annotation.getRealHeight()));
      model.setLocation(mapClient.getAddress(annotation.getLocation().getLatitude(), annotation.getLocation().getLongitude()));
      if(model.getCategory().equals("SIGN") || model.getCategory().equals("LAMP")){
        model.setType(InfraType.ASSET);
      } else {
        model.setType(InfraType.ABNORMALITY);
      }
      model.setLevel(Utils.loadLevel(model.getType(), model.getStatus(), model.getRealWidth(), model.getRealHeight()));

      InfraImage infraImage = new InfraImage();
      infraImage.setPathUrl(image.getPathUrl());
      infraImage.setFrame(image.getFrame());
      // Thêm object vào list
      model.setImage(infraImageService.processImage(infraImage));
      model.setKeyId(keyID);

      InfraObject existedInfra = infraProcessingService.findByLocation(model.getCameraId(), model.getCategory(), model.getName(),
          model.getLatitude(), model.getLongitude());

      if(existedInfra == null) {
        model.setEventStatus(EventStatus.NEW);
        saveProcess = infraObjectProcessRepository.save(model);
      }else {
        model.setEventStatus(EventStatus.UPDATED);
        model.setInfraObject(existedInfra);
        saveProcess =infraObjectProcessRepository.save(model);
      }
      redisService.pushKeyId(jsonObject.getInfo().getScheduleId(), keyID);

      try{
        String destination = "/topic/process/" + model.getScheduleId();
        webSocketService.sendMessage(destination, objectMapper.writeValueAsString(saveProcess));
      } catch (Exception e) {
        log.error("Error sending message to WebSocket: {}", e.getMessage());
      }
      infraObjectProcessList.add(saveProcess);

    }
    return infraObjectProcessList;
  }
}