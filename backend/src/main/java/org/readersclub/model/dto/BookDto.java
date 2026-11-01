package org.readersclub.model.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import org.readersclub.model.BookStatus;

// Full edit of a book. The cover (image) can't be changed here; upload comes in Phase 10.
@Builder
public record BookDto(

        @NotBlank
        String title,

        @NotBlank
        String author,

        @NotBlank
        String tag,

        @NotBlank
        String wiki,

        @NotNull
        BookStatus status,

        // Required for a finished book; ignored (stored as null) for any other status
        @Min(1)
        @Max(10)
        Double rating
) {

    @AssertTrue(message = "Book rating is missing. Min: 1, Max: 10")
    public boolean isRatingGivenWhenFinished() {
        return status != BookStatus.FINISHED || rating != null;
    }
}
