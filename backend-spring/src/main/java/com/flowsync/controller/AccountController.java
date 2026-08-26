package com.flowsync.controller;

import com.flowsync.dto.DataEnvelope;
import com.flowsync.dto.UserResponse;
import com.flowsync.entity.User;
import java.util.Map;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Equivalente a ProfileController + AccessTokensController.destroy (rutas protegidas
 * /api/v1/account/*).
 *
 * <p>profile() usa ctx.serialize(...) en el original -> va envuelto en "data". logout() devuelve el
 * objeto plano -> sin envolver.
 *
 * <p>Con JWT stateless no hay token que revocar del lado servidor: "logout" es responsabilidad del
 * cliente (descartar el token). Si se requiere invalidación real, añadir una blacklist (p.ej.
 * Redis) aquí.
 */
@RestController
@RequestMapping("/api/v1/account")
public class AccountController {

  @GetMapping("/profile")
  public DataEnvelope<UserResponse> profile(@AuthenticationPrincipal User user) {
    return DataEnvelope.of(UserResponse.from(user));
  }

  @PostMapping("/logout")
  public Map<String, String> logout() {
    return Map.of("message", "Logged out successfully");
  }
}
