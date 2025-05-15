package com.example.infrastructure_service.model;

import com.example.infrastructure_service.enums.TicketStatus;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ProcessTicket {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  private String title;
  private String description;

  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
  private Integer level;
  @Enumerated(EnumType.STRING)
  private TicketStatus ticketStatus;

  private String assignedTo;
}
