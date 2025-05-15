package com.example.infrastructure_service.kafka;

import lombok.AllArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@AllArgsConstructor
public class MessageProducer {

  private final KafkaTemplate<String, String> kafkaTemplate;

  public void sendDataToTopic(String topic, String data) {
      kafkaTemplate.send(topic, data);
  }
}
