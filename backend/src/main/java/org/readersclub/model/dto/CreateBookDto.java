package org.readersclub.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Builder;

@Builder
public record CreateBookDto(

        @NotBlank
        String title,

        @NotBlank
        String author,

        // Optional until cover upload (Phase 10); a book without one shows a placeholder
        @Pattern(regexp = "images\\/(.+?)\\/?(?:.jpg)", message = "Incorrect image path. Pattern: images/*.jpg")
        String image,

        @NotBlank
        String tag,

        @NotBlank
        String wiki
) {
}
