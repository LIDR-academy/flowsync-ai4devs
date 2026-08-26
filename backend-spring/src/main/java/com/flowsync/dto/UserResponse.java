package com.flowsync.dto;

import com.flowsync.entity.User;
import java.time.Instant;

/** Equivalente a UserTransformer (app/transformers/user_transformer.ts). */
public record UserResponse(
    Long id, String fullName, String email, Instant createdAt, Instant updatedAt, String initials) {

  public static UserResponse from(User user) {
    return new UserResponse(
        user.getId(),
        user.getFullName(),
        user.getEmail(),
        user.getCreatedAt(),
        user.getUpdatedAt(),
        user.getInitials());
  }
}
