package org.readersclub.api;

import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.RepeatedTest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.EnumSource;
import org.junit.jupiter.params.provider.MethodSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.readersclub.IntegrationTest;
import org.readersclub.model.Book;
import org.readersclub.model.BookStatus;
import org.springframework.http.MediaType;

import java.time.Instant;
import java.util.stream.Stream;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.readersclub.api.factory.BookFactory.createBook;
import static org.readersclub.api.factory.BookFactory.createDefaultBook;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class BookControllerTests extends IntegrationTest {

    private static final String MISSING_ID = "000000000000000000000000";

    private Book save(BookStatus status) {
        return bookRepository.save(createDefaultBook(status));
    }

    private Book save(BookStatus status, String tag) {
        return bookRepository.save(createBook("title", "author", "wiki", "images/image.jpg", 5.0, status, tag));
    }

    @Nested
    class GetBooks {

        @Test
        void returnsAllBooks() throws Exception {
            save(BookStatus.NEW);
            save(BookStatus.PROGRESS);
            save(BookStatus.FINISHED);

            mockMvc.perform(get("/api/books"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(3));
        }

        @ParameterizedTest
        @EnumSource(BookStatus.class)
        void returnsBooksByStatus(BookStatus status) throws Exception {
            save(BookStatus.NEW);
            save(BookStatus.PROGRESS);
            save(BookStatus.FINISHED);

            mockMvc.perform(get("/api/books").param("status", status.getValue()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(1))
                    .andExpect(jsonPath("$[0].status").value(status.getValue()));
        }

        @Test
        void rejectsInvalidStatus() throws Exception {
            mockMvc.perform(get("/api/books").param("status", "reading"))
                    .andExpect(status().isBadRequest())
                    .andExpect(content().contentType(MediaType.APPLICATION_PROBLEM_JSON));
        }
    }

    @Nested
    class GetBookById {

        @Test
        void returnsBook() throws Exception {
            Book book = save(BookStatus.NEW);

            mockMvc.perform(get("/api/books/{id}", book.getId()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(book.getId()))
                    .andExpect(jsonPath("$.title").value("title"))
                    .andExpect(jsonPath("$.status").value("new"));
        }

        @ParameterizedTest
        @ValueSource(strings = {MISSING_ID, "not-an-object-id"})
        void returns404WhenMissing(String id) throws Exception {
            mockMvc.perform(get("/api/books/{id}", id))
                    .andExpect(status().isNotFound())
                    .andExpect(content().contentType(MediaType.APPLICATION_PROBLEM_JSON))
                    .andExpect(jsonPath("$.detail").value(containsString(id)));
        }
    }

    @Nested
    class AddBook {

        private static final String VALID_BODY = """
                {"title": "Title", "author": "Author", "image": "images/cover.jpg", "tag": "tag", "wiki": "https://wiki"}
                """;

        @Test
        void createsNewBook() throws Exception {
            mockMvc.perform(post("/api/books/add").contentType(MediaType.APPLICATION_JSON).content(VALID_BODY))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.id").isNotEmpty())
                    .andExpect(jsonPath("$.status").value("new"))
                    .andExpect(jsonPath("$.title").value("Title"))
                    .andExpect(jsonPath("$.createdAt").isNotEmpty());

            assertEquals(1, bookRepository.count());
        }

        static Stream<Arguments> invalidBodies() {
            return Stream.of(
                    Arguments.of("title", """
                            {"author": "Author", "image": "images/cover.jpg", "tag": "tag", "wiki": "w"}"""),
                    Arguments.of("author", """
                            {"title": "Title", "image": "images/cover.jpg", "tag": "tag", "wiki": "w"}"""),
                    Arguments.of("image", """
                            {"title": "Title", "author": "Author", "tag": "tag", "wiki": "w"}"""),
                    Arguments.of("image", """
                            {"title": "Title", "author": "Author", "image": "cover.png", "tag": "tag", "wiki": "w"}"""),
                    Arguments.of("tag", """
                            {"title": "Title", "author": "Author", "image": "images/cover.jpg", "wiki": "w"}"""),
                    Arguments.of("wiki", """
                            {"title": "Title", "author": "Author", "image": "images/cover.jpg", "tag": "tag"}""")
            );
        }

        @ParameterizedTest
        @MethodSource("invalidBodies")
        void rejectsInvalidBook(String invalidField, String body) throws Exception {
            mockMvc.perform(post("/api/books/add").contentType(MediaType.APPLICATION_JSON).content(body))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.errors." + invalidField).isNotEmpty());

            assertEquals(0, bookRepository.count());
        }
    }

    @Nested
    class UpdateBook {

        @Test
        void updatesOnlyGivenFieldsAndKeepsCreatedAt() throws Exception {
            Book saved = save(BookStatus.FINISHED);
            Instant createdAt = bookRepository.findById(saved.getId()).orElseThrow().getCreatedAt();

            mockMvc.perform(patch("/api/books/{id}/update", saved.getId())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    {"title": "New title"}"""))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.title").value("New title"))
                    .andExpect(jsonPath("$.author").value("author"))
                    .andExpect(jsonPath("$.status").value("finished"))
                    .andExpect(jsonPath("$.rating").value(5.0));

            Book updated = bookRepository.findById(saved.getId()).orElseThrow();
            assertEquals("New title", updated.getTitle());
            assertEquals("wiki", updated.getWiki());
            assertEquals(createdAt, updated.getCreatedAt());
        }

        @Test
        void returns404WhenMissing() throws Exception {
            mockMvc.perform(patch("/api/books/{id}/update", MISSING_ID)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{}"))
                    .andExpect(status().isNotFound());
        }

        @ParameterizedTest
        @ValueSource(strings = {
                """
                {"image": "cover.png"}""",
                """
                {"rating": 11}""",
                """
                {"status": "reading"}"""
        })
        void rejectsInvalidValues(String body) throws Exception {
            Book saved = save(BookStatus.NEW);

            mockMvc.perform(patch("/api/books/{id}/update", saved.getId())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    class StartBook {

        @Test
        void startsNewBook() throws Exception {
            Book book = save(BookStatus.NEW);

            mockMvc.perform(patch("/api/books/{id}/start", book.getId()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("progress"));

            assertEquals(BookStatus.PROGRESS, bookRepository.findById(book.getId()).orElseThrow().getStatus());
        }

        @ParameterizedTest
        @EnumSource(value = BookStatus.class, names = {"PROGRESS", "FINISHED"})
        void returns409WhenNotNew(BookStatus status) throws Exception {
            Book book = save(status);

            mockMvc.perform(patch("/api/books/{id}/start", book.getId()))
                    .andExpect(status().isConflict())
                    .andExpect(content().contentType(MediaType.APPLICATION_PROBLEM_JSON));
        }

        @Test
        void returns404WhenMissing() throws Exception {
            mockMvc.perform(patch("/api/books/{id}/start", MISSING_ID))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    class FinishBook {

        @Test
        void finishesBookInProgress() throws Exception {
            Book book = save(BookStatus.PROGRESS);

            mockMvc.perform(patch("/api/books/{id}/finish", book.getId())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    {"rating": 8.5}"""))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("finished"))
                    .andExpect(jsonPath("$.rating").value(8.5));
        }

        @Test
        void acceptsRatingAsString() throws Exception {
            Book book = save(BookStatus.PROGRESS);

            mockMvc.perform(patch("/api/books/{id}/finish", book.getId())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    {"rating": "10.00"}"""))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.rating").value(10.0));
        }

        @ParameterizedTest
        @ValueSource(strings = {"""
                {"rating": 0}""", """
                {"rating": 11}""", "{}"})
        void rejectsInvalidRating(String body) throws Exception {
            Book book = save(BookStatus.PROGRESS);

            mockMvc.perform(patch("/api/books/{id}/finish", book.getId())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.errors.rating").isNotEmpty());
        }

        @ParameterizedTest
        @EnumSource(value = BookStatus.class, names = {"NEW", "FINISHED"})
        void returns409WhenNotInProgress(BookStatus status) throws Exception {
            Book book = save(status);

            mockMvc.perform(patch("/api/books/{id}/finish", book.getId())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    {"rating": 7}"""))
                    .andExpect(status().isConflict());
        }

        @Test
        void returns404WhenMissing() throws Exception {
            mockMvc.perform(patch("/api/books/{id}/finish", MISSING_ID)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    {"rating": 7}"""))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    class DeleteBook {

        @Test
        void deletesBook() throws Exception {
            Book book = save(BookStatus.NEW);

            mockMvc.perform(delete("/api/books/{id}", book.getId()))
                    .andExpect(status().isOk());

            assertFalse(bookRepository.existsById(book.getId()));
        }

        @Test
        void returns404WhenMissing() throws Exception {
            mockMvc.perform(delete("/api/books/{id}", MISSING_ID))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    class RandomBook {

        @RepeatedTest(10)
        void picksOnlyNewBooksWhenNoIdsGiven() throws Exception {
            save(BookStatus.NEW);
            save(BookStatus.NEW);
            save(BookStatus.PROGRESS);
            save(BookStatus.FINISHED);
            save(BookStatus.FINISHED);

            mockMvc.perform(get("/api/books/random"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("new"));
        }

        @RepeatedTest(10)
        void picksOneOfGivenIds() throws Exception {
            Book first = save(BookStatus.FINISHED);
            Book second = save(BookStatus.PROGRESS);
            save(BookStatus.NEW);

            mockMvc.perform(get("/api/books/random").param("booksId", first.getId(), second.getId()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(oneOf(first.getId(), second.getId())));
        }

        @Test
        void returns404WhenNoNewBooks() throws Exception {
            save(BookStatus.FINISHED);

            mockMvc.perform(get("/api/books/random"))
                    .andExpect(status().isNotFound())
                    .andExpect(content().contentType(MediaType.APPLICATION_PROBLEM_JSON));
        }
    }

    @Test
    void statisticsCountsNonNewBooksPerTag() throws Exception {
        save(BookStatus.FINISHED, "novel");
        save(BookStatus.FINISHED, "novel");
        save(BookStatus.PROGRESS, "novel");
        save(BookStatus.NEW, "novel");
        save(BookStatus.FINISHED, "poetry");
        save(BookStatus.NEW, "essay");

        mockMvc.perform(get("/api/statistics"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statistics.novel").value(3))
                .andExpect(jsonPath("$.statistics.poetry").value(1))
                .andExpect(jsonPath("$.statistics.essay").value(0));
    }
}
