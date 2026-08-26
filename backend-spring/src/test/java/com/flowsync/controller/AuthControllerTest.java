package com.flowsync.controller;

import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerTest {

  @Autowired private MockMvc mockMvc;
  private final ObjectMapper objectMapper = new ObjectMapper();

  private static final String SIGNUP_BODY =
      """
      {
        "fullName": "Ada Lovelace",
        "email": "ada@example.com",
        "password": "password123",
        "passwordConfirmation": "password123"
      }
      """;

  @Test
  void signupLoginAndProfileFlow() throws Exception {
    // Respuestas envueltas en "data" (equivalente a ctx.serialize() + ApiSerializer).
    mockMvc
        .perform(
            post("/api/v1/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(SIGNUP_BODY))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.user.email").value("ada@example.com"))
        .andExpect(jsonPath("$.data.user.initials").value("AL"))
        .andExpect(jsonPath("$.data.token").value(notNullValue()));

    String loginBody =
        """
        { "email": "ada@example.com", "password": "password123" }
        """;

    MvcResult loginResult =
        mockMvc
            .perform(
                post("/api/v1/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(loginBody))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.user.email").value("ada@example.com"))
            .andReturn();

    String token =
        objectMapper
            .readTree(loginResult.getResponse().getContentAsString())
            .get("data")
            .get("token")
            .asText();

    mockMvc
        .perform(get("/api/v1/account/profile").header("Authorization", "Bearer " + token))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.email").value("ada@example.com"));

    // logout() en el original devuelve el objeto plano, sin envolver en "data".
    mockMvc
        .perform(post("/api/v1/account/logout").header("Authorization", "Bearer " + token))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.message").value("Logged out successfully"))
        .andExpect(jsonPath("$.data").doesNotExist());
  }

  @Test
  void profileWithoutTokenIsUnauthorized() throws Exception {
    mockMvc.perform(get("/api/v1/account/profile")).andExpect(status().isUnauthorized());
  }

  @Test
  void signupWithInvalidPayloadReturns422WithVineShapedErrors() throws Exception {
    String invalidBody =
        """
        { "email": "not-an-email", "password": "short", "passwordConfirmation": "short" }
        """;

    mockMvc
        .perform(
            post("/api/v1/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidBody))
        .andExpect(status().isUnprocessableEntity())
        .andExpect(jsonPath("$.errors").isArray())
        .andExpect(jsonPath("$.errors[0].field").exists())
        .andExpect(jsonPath("$.errors[0].message").exists())
        .andExpect(jsonPath("$.errors[0].rule").exists());
  }

  @Test
  void signupWithDuplicateEmailReturns422AsValidationError() throws Exception {
    mockMvc.perform(
        post("/api/v1/auth/signup").contentType(MediaType.APPLICATION_JSON).content(SIGNUP_BODY));

    mockMvc
        .perform(
            post("/api/v1/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(SIGNUP_BODY))
        .andExpect(status().isUnprocessableEntity())
        .andExpect(jsonPath("$.errors[0].field").value("email"))
        .andExpect(jsonPath("$.errors[0].rule").value("database.unique"));
  }

  @Test
  void unknownRouteReturnsJsonNotFoundInsteadOfWhitelabelHtml() throws Exception {
    // Rutas públicas (permitAll) que no existen: Spring Security no interfiere,
    // por lo que se valida directamente el fallback de DispatcherServlet.
    mockMvc
        .perform(get("/api/v1/auth/does-not-exist"))
        .andExpect(status().isNotFound())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON))
        .andExpect(jsonPath("$.message").exists());
  }
}
