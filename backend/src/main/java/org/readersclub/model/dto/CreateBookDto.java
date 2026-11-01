package org.readersclub.model.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;

@Builder
public record CreateBookDto(

        @NotBlank
        String title,

        @NotBlank
        String author,

        @NotBlank
        String tag,

        @NotBlank
        String wiki
) {
}
