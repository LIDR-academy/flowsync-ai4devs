package com.flowsync.entity;

import jakarta.persistence.*;
import java.time.Instant;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Equivalente a app/models/user.ts (AdonisJS). */
@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
public class User {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "full_name")
  private String fullName;

  @Column(nullable = false, unique = true)
  private String email;

  @Column(nullable = false)
  private String password;

  @Column(name = "created_at", nullable = false, updatable = false)
  private Instant createdAt;

  @Column(name = "updated_at")
  private Instant updatedAt;

  @PrePersist
  void onCreate() {
    createdAt = Instant.now();
    updatedAt = createdAt;
  }

  @PreUpdate
  void onUpdate() {
    updatedAt = Instant.now();
  }

  /** Replica el getter `initials` del modelo original. */
  public String getInitials() {
    String source = (fullName != null && !fullName.isBlank()) ? fullName : email.split("@")[0];
    String[] parts = source.trim().split("\\s+");
    if (parts.length >= 2) {
      return ("" + parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    }
    String first = parts[0];
    return first.substring(0, Math.min(2, first.length())).toUpperCase();
  }
}
