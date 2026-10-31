package org.readersclub.model.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import lombok.Builder;
import org.readersclub.model.BookStatus;

@Builder
public record BookDto(

        String title,

        String author,

        @Pattern(regexp = "images\\/(.+?)\\/?(?:.jpg)", message = "Incorrect image path. Pattern: images/*.jpg")
        String image,

        String tag,

        String wiki,

        BookStatus status, //TODO: Add status validator

        @Min(1)
        @Max(10)
        Double rating
) {
}
