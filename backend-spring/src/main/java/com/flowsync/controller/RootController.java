package com.flowsync.controller;

import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/** Equivalente a router.get('/', () => ({ hello: 'world' })) en start/routes.ts. */
@RestController
public class RootController {

  @GetMapping("/")
  public Map<String, String> hello() {
    return Map.of("hello", "world");
  }
}
