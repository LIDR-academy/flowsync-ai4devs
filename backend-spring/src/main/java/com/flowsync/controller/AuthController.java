package com.flowsync.controller;

import com.flowsync.dto.AuthResponse;
import com.flowsync.dto.DataEnvelope;
import com.flowsync.dto.LoginRequest;
import com.flowsync.dto.SignupRequest;
import com.flowsync.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Equivalente a NewAccountController + AccessTokensController.store (rutas /api/v1/auth/*). Ambos
 * métodos originales devuelven vía ctx.serialize(...), por lo que la respuesta va envuelta en
 * "data" (ver providers/api_provider.ts).
 */
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

  private final AuthService authService;

  public AuthController(AuthService authService) {
    this.authService = authService;
  }

  @PostMapping("/signup")
  public DataEnvelope<AuthResponse> signup(@Valid @RequestBody SignupRequest request) {
    return DataEnvelope.of(authService.signup(request));
  }

  @PostMapping("/login")
  public DataEnvelope<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
    return DataEnvelope.of(authService.login(request));
  }
}
