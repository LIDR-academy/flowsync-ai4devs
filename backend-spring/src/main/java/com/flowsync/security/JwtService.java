package com.flowsync.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.security.Key;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * Emite y valida JWTs. Sustituye a DbAccessTokensProvider (@adonisjs/auth/access_tokens): en vez de
 * persistir el token hasheado en la tabla auth_access_tokens, aquí el token es autocontenido y
 * stateless (firmado con HMAC).
 */
@Service
public class JwtService {

  private final Key signingKey;
  private final long expirationMinutes;

  public JwtService(
      @Value("${flowsync.jwt.secret}") String secret,
      @Value("${flowsync.jwt.expiration-minutes}") long expirationMinutes) {
    this.signingKey = Keys.hmacShaKeyFor(secret.getBytes());
    this.expirationMinutes = expirationMinutes;
  }

  public String generateToken(String email) {
    Instant now = Instant.now();
    return Jwts.builder()
        .subject(email)
        .issuedAt(Date.from(now))
        .expiration(Date.from(now.plus(expirationMinutes, ChronoUnit.MINUTES)))
        .signWith(signingKey)
        .compact();
  }

  public String extractEmail(String token) {
    return parseClaims(token).getSubject();
  }

  public boolean isValid(String token) {
    try {
      Claims claims = parseClaims(token);
      return claims.getExpiration().after(Date.from(Instant.now()));
    } catch (Exception e) {
      return false;
    }
  }

  private Claims parseClaims(String token) {
    return Jwts.parser()
        .verifyWith((javax.crypto.SecretKey) signingKey)
        .build()
        .parseSignedClaims(token)
        .getPayload();
  }
}
