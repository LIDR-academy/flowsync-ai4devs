package com.flowsync.dto;

/**
 * Equivalente al ApiSerializer de providers/api_provider.ts (wrap: 'data'). Usar solo en los
 * endpoints que en AdonisJS llaman a ctx.serialize(...); los que devuelven el objeto plano (p. ej.
 * logout, "/") no se envuelven.
 */
public record DataEnvelope<T>(T data) {
  public static <T> DataEnvelope<T> of(T data) {
    return new DataEnvelope<>(data);
  }
}
