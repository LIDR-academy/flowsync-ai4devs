package com.flowsync.service;

import com.flowsync.dto.AuthResponse;
import com.flowsync.dto.LoginRequest;
import com.flowsync.dto.SignupRequest;
import com.flowsync.dto.UserResponse;
import com.flowsync.entity.User;
import com.flowsync.exception.InvalidCredentialsException;
import com.flowsync.exception.ValidationErrorItem;
import com.flowsync.exception.ValidationException;
import com.flowsync.repository.UserRepository;
import com.flowsync.security.JwtService;
import java.util.List;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Agrupa la lógica hoy repartida entre NewAccountController y AccessTokensController (AdonisJS).
 */
@Service
public class AuthService {

  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtService jwtService;

  public AuthService(
      UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
    this.jwtService = jwtService;
  }

  @Transactional
  public AuthResponse signup(SignupRequest request) {
    if (userRepository.existsByEmail(request.email())) {
      throw new ValidationException(
          List.of(
              new ValidationErrorItem(
                  "The email has already been taken", "database.unique", "email")));
    }

    User user = new User();
    user.setFullName(request.fullName());
    user.setEmail(request.email());
    user.setPassword(passwordEncoder.encode(request.password()));
    userRepository.save(user);

    String token = jwtService.generateToken(user.getEmail());
    return new AuthResponse(UserResponse.from(user), token);
  }

  public AuthResponse login(LoginRequest request) {
    User user =
        userRepository.findByEmail(request.email()).orElseThrow(InvalidCredentialsException::new);

    if (!passwordEncoder.matches(request.password(), user.getPassword())) {
      throw new InvalidCredentialsException();
    }

    String token = jwtService.generateToken(user.getEmail());
    return new AuthResponse(UserResponse.from(user), token);
  }
}
