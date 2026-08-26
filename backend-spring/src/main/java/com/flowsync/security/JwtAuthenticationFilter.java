package com.flowsync.security;

import com.flowsync.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Equivalente a app/middleware/auth_middleware.ts: extrae el Bearer token, lo valida y puebla el
 * SecurityContext con el usuario autenticado.
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

  private final JwtService jwtService;
  private final UserRepository userRepository;

  public JwtAuthenticationFilter(JwtService jwtService, UserRepository userRepository) {
    this.jwtService = jwtService;
    this.userRepository = userRepository;
  }

  @Override
  protected void doFilterInternal(
      @NonNull HttpServletRequest request,
      @NonNull HttpServletResponse response,
      @NonNull FilterChain filterChain)
      throws ServletException, IOException {
    String header = request.getHeader("Authorization");

    if (header != null && header.startsWith("Bearer ")) {
      String token = header.substring(7);

      if (jwtService.isValid(token)) {
        String email = jwtService.extractEmail(token);

        userRepository
            .findByEmail(email)
            .ifPresent(
                user -> {
                  var authentication =
                      new UsernamePasswordAuthenticationToken(user, null, List.of());
                  SecurityContextHolder.getContext().setAuthentication(authentication);
                });
      }
    }

    filterChain.doFilter(request, response);
  }
}
