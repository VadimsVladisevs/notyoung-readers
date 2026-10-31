package org.readersclub.model;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;

@Getter
@Setter
@Validated
@Builder
@Document("books")
public class Book {
    @Id
    private String id;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;

    @NotNull
    private String title;

    @NotNull
    private String author;

    @NotNull
    private String image;

    @NotNull
    private BookStatus status;

    @NotNull
    private String tag;

    @NotNull
    private String wiki;

    @Min(1)
    @Max(10)
    private Double rating;
}
