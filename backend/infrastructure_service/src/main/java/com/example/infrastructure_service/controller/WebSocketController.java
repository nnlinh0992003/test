package com.example.infrastructure_service.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
@Slf4j
public class WebSocketController {

  private final SimpMessagingTemplate messagingTemplate;

  public WebSocketController(SimpMessagingTemplate messagingTemplate) {
    this.messagingTemplate = messagingTemplate;
  }

  @MessageMapping("/sendMessage")
  public void receiveMessage(String message) {
    log.info("Received message: {}", message);
    messagingTemplate.convertAndSend("/topic/messages", message);
  }

}