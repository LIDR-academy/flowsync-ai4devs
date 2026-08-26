package com.flowsync.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Equivalente a signupValidator (app/validators/user.ts). */
public record SignupRequest(
    String fullName,
    @Email @Size(max = 254) @NotBlank String email,
    @Size(min = 8, max = 32) @NotBlank String password,
    @NotBlank String passwordConfirmation) {

  @AssertTrue(message = "passwordConfirmation must match password")
  public boolean isPasswordConfirmed() {
    return password != null && password.equals(passwordConfirmation);
  }
}
