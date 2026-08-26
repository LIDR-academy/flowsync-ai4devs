package com.flowsync.dto;

/**
 * Equivalente al payload { user, token } devuelto por NewAccountController.store y
 * AccessTokensController.store.
 */
public record AuthResponse(UserResponse user, String token) {}
