package com.example.infrastructure_service.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class WebSocketService {

  private final SimpMessagingTemplate messagingTemplate;

  public void sendMessage(String destination, String message) {
    messagingTemplate.convertAndSend(destination, message);
    log.info("Message sent to WebSocket:");
  }
}
