package com.flowsync.exception;

import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.NoHandlerFoundException;

/**
 * Equivalente a app/exceptions/handler.ts + force_json_response_middleware.ts: centraliza el shape
 * de las respuestas de error y garantiza que TODO error (validación, negocio, 404, o cualquier
 * excepción no prevista) vuelva como JSON en vez de la página Whitelabel de Spring.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

  private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

  /** Equivalente al shape 422 de VineJS: { "errors": [{ message, rule, field }] }. */
  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
    List<ValidationErrorItem> errors =
        ex.getBindingResult().getFieldErrors().stream()
            .map(
                fieldError ->
                    new ValidationErrorItem(
                        fieldError.getDefaultMessage(),
                        toRuleName(fieldError.getCode()),
                        fieldError.getField()))
            .toList();

    return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(Map.of("errors", errors));
  }

  @ExceptionHandler(ValidationException.class)
  public ResponseEntity<Map<String, Object>> handleValidation(ValidationException ex) {
    return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY)
        .body(Map.of("errors", ex.getErrors()));
  }

  @ExceptionHandler(InvalidCredentialsException.class)
  public ResponseEntity<Map<String, String>> handleInvalidCredentials(
      InvalidCredentialsException ex) {
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", ex.getMessage()));
  }

  /** Ruta sin handler registrado (equivalente al 404 "Cannot GET:/x" de Adonis). */
  @ExceptionHandler(NoHandlerFoundException.class)
  public ResponseEntity<Map<String, String>> handleNotFound(NoHandlerFoundException ex) {
    return ResponseEntity.status(HttpStatus.NOT_FOUND)
        .body(Map.of("message", "Cannot " + ex.getHttpMethod() + ":" + ex.getRequestURL()));
  }

  @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
  public ResponseEntity<Map<String, String>> handleMethodNotAllowed(
      HttpRequestMethodNotSupportedException ex) {
    return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED)
        .body(Map.of("message", ex.getMessage()));
  }

  /** Red de seguridad: cualquier excepción no prevista sigue devolviendo JSON, nunca HTML. */
  @ExceptionHandler(Exception.class)
  public ResponseEntity<Map<String, String>> handleUnexpected(Exception ex) {
    log.error("Unhandled exception", ex);
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
        .body(Map.of("message", "Internal server error"));
  }

  private static String toRuleName(String springErrorCode) {
    if (springErrorCode == null || springErrorCode.isEmpty()) {
      return "invalid";
    }
    return Character.toLowerCase(springErrorCode.charAt(0)) + springErrorCode.substring(1);
  }
}
