package org.readersclub.model.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

@Builder
public record FinishBookDto(
        @NotNull(message = "Book rating is missing. Min: 1, Max: 10")
        @Min(value = 1, message = "Incorrect value. Min: 1")
        @Max(value = 10, message = "Incorrect value. Max: 10")
        Double rating
) {
}
