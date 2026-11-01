package org.readersclub.model.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginDto(
        @NotBlank(message = "Username is missing")
        String username,
        @NotBlank(message = "Password is missing")
        String password
) {
}
