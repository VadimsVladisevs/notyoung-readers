package org.readersclub.model.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Builder;

@Builder
public record CreateBookDto(

        @NotNull
        String title,

        @NotNull
        String author,

        @NotNull
        @Pattern(regexp = "images\\/(.+?)\\/?(?:.jpg)", message = "Incorrect image path. Pattern: images/*.jpg")
        String image,

        @NotNull
        String tag,

        @NotNull
        String wiki
) {
}
