package com.flowsync.exception;

import java.util.List;

/**
 * Errores de validación de negocio (p. ej. email duplicado) que en VineJS se resuelven como parte
 * del propio schema (email().unique(...)) y por tanto viajan con el mismo shape 422 que las reglas
 * declarativas.
 */
public class ValidationException extends RuntimeException {
  private final List<ValidationErrorItem> errors;

  public ValidationException(List<ValidationErrorItem> errors) {
    super("Validation failed");
    this.errors = errors;
  }

  public List<ValidationErrorItem> getErrors() {
    return errors;
  }
}
