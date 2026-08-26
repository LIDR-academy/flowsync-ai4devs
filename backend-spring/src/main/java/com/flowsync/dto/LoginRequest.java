package com.flowsync.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/** Equivalente a loginValidator (app/validators/user.ts). */
public record LoginRequest(@Email @NotBlank String email, @NotBlank String password) {}
