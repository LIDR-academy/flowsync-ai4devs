package com.flowsync.exception;

/** Equivalente a un item de error de VineJS: { message, rule, field }. */
public record ValidationErrorItem(String message, String rule, String field) {}
