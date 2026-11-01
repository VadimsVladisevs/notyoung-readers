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
import org.springframework.test.web.servlet.ResultActions;

import java.time.Instant;
import java.util.stream.Stream;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
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
                {"title": "Title", "author": "Author", "tag": "tag", "wiki": "https://wiki"}
                """;

        @Test
        void createsNewBook() throws Exception {
            mockMvc.perform(post("/api/books/add").with(admin()).contentType(MediaType.APPLICATION_JSON).content(VALID_BODY))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.id").isNotEmpty())
                    .andExpect(jsonPath("$.status").value("new"))
                    .andExpect(jsonPath("$.title").value("Title"))
                    .andExpect(jsonPath("$.createdAt").isNotEmpty());

            assertEquals(1, bookRepository.count());
        }

        @Test
        void createsBookWithoutImage() throws Exception {
            mockMvc.perform(post("/api/books/add").with(admin()).contentType(MediaType.APPLICATION_JSON).content("""
                            {"title": "Title", "author": "Author", "tag": "tag", "wiki": "w"}"""))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.image").doesNotExist());

            assertEquals(null, bookRepository.findAll().getFirst().getImage());
        }

        @Test
        void trimsFields() throws Exception {
            mockMvc.perform(post("/api/books/add").with(admin()).contentType(MediaType.APPLICATION_JSON).content("""
                            {"title": " Title ", "author": " Author ", "tag": " tag ", "wiki": " w "}"""))
                    .andExpect(status().isCreated());

            Book saved = bookRepository.findAll().getFirst();
            assertEquals("Title", saved.getTitle());
            assertEquals("Author", saved.getAuthor());
            assertEquals("tag", saved.getTag());
            assertEquals("w", saved.getWiki());
        }

        static Stream<Arguments> invalidBodies() {
            return Stream.of(
                    Arguments.of("title", """
                            {"author": "Author", "tag": "tag", "wiki": "w"}"""),
                    Arguments.of("title", """
                            {"title": "  ", "author": "Author", "tag": "tag", "wiki": "w"}"""),
                    Arguments.of("author", """
                            {"title": "Title", "tag": "tag", "wiki": "w"}"""),
                    Arguments.of("author", """
                            {"title": "Title", "author": "", "tag": "tag", "wiki": "w"}"""),
                    Arguments.of("tag", """
                            {"title": "Title", "author": "Author", "tag": " ", "wiki": "w"}"""),
                    Arguments.of("wiki", """
                            {"title": "Title", "author": "Author", "tag": "tag", "wiki": "  "}"""),
                    Arguments.of("tag", """
                            {"title": "Title", "author": "Author", "wiki": "w"}"""),
                    Arguments.of("wiki", """
                            {"title": "Title", "author": "Author", "tag": "tag"}""")
            );
        }

        @ParameterizedTest
        @MethodSource("invalidBodies")
        void rejectsInvalidBook(String invalidField, String body) throws Exception {
            mockMvc.perform(post("/api/books/add").with(admin()).contentType(MediaType.APPLICATION_JSON).content(body))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.errors." + invalidField).isNotEmpty());

            assertEquals(0, bookRepository.count());
        }
    }

    @Nested
    class UpdateBook {

        private static final String EDIT_BODY = """
                {"title": "  New title ", "author": " New author ", "tag": " New tag ", "wiki": " New wiki ",
                 "status": "finished", "rating": 8}""";

        private ResultActions update(String id, String body) throws Exception {
            return mockMvc.perform(patch("/api/books/{id}/update", id).with(admin())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(body));
        }

        @Test
        void replacesFieldsTrimmedAndKeepsCreatedAtAndImage() throws Exception {
            Book saved = save(BookStatus.FINISHED);
            Instant createdAt = bookRepository.findById(saved.getId()).orElseThrow().getCreatedAt();

            update(saved.getId(), EDIT_BODY)
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.title").value("New title"))
                    .andExpect(jsonPath("$.status").value("finished"))
                    .andExpect(jsonPath("$.rating").value(8.0));

            Book updated = bookRepository.findById(saved.getId()).orElseThrow();
            assertEquals("New title", updated.getTitle());
            assertEquals("New author", updated.getAuthor());
            assertEquals("New tag", updated.getTag());
            assertEquals("New wiki", updated.getWiki());
            assertEquals("images/image.jpg", updated.getImage());
            assertEquals(createdAt, updated.getCreatedAt());
        }

        @Test
        void ignoresImageInBody() throws Exception {
            Book saved = save(BookStatus.NEW);

            update(saved.getId(), """
                    {"title": "t", "author": "a", "tag": "x", "wiki": "w", "status": "new", "image": "images/other.jpg"}""")
                    .andExpect(status().isOk());

            assertEquals("images/image.jpg", bookRepository.findById(saved.getId()).orElseThrow().getImage());
        }

        @ParameterizedTest
        @EnumSource(value = BookStatus.class, names = {"NEW", "PROGRESS"})
        void clearsRatingWhenNotFinished(BookStatus status) throws Exception {
            Book saved = save(BookStatus.FINISHED);

            update(saved.getId(), """
                    {"title": "t", "author": "a", "tag": "x", "wiki": "w", "status": "%s", "rating": 7}"""
                    .formatted(status.getValue()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value(status.getValue()))
                    .andExpect(jsonPath("$.rating").doesNotExist());

            assertNull(bookRepository.findById(saved.getId()).orElseThrow().getRating());
        }

        @Test
        void rejectsSecondBookInProgress() throws Exception {
            save(BookStatus.PROGRESS);
            Book saved = save(BookStatus.NEW);

            update(saved.getId(), """
                    {"title": "t", "author": "a", "tag": "x", "wiki": "w", "status": "progress"}""")
                    .andExpect(status().isConflict());

            assertEquals(BookStatus.NEW, bookRepository.findById(saved.getId()).orElseThrow().getStatus());
        }

        @Test
        void keepsTheBookInProgress() throws Exception {
            Book saved = save(BookStatus.PROGRESS);

            update(saved.getId(), """
                    {"title": "Renamed", "author": "a", "tag": "x", "wiki": "w", "status": "progress"}""")
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.title").value("Renamed"));
        }

        @Test
        void returns404WhenMissing() throws Exception {
            update(MISSING_ID, EDIT_BODY)
                    .andExpect(status().isNotFound());
        }

        @ParameterizedTest
        @ValueSource(strings = {
                """
                {"title": " ", "author": "a", "tag": "x", "wiki": "w", "status": "new"}""",
                """
                {"title": "t", "author": "", "tag": "x", "wiki": "w", "status": "new"}""",
                """
                {"title": "t", "author": "a", "tag": " ", "wiki": "w", "status": "new"}""",
                """
                {"title": "t", "author": "a", "tag": "x", "status": "new"}""",
                """
                {"title": "t", "author": "a", "tag": "x", "wiki": "w"}""",
                """
                {"title": "t", "author": "a", "tag": "x", "wiki": "w", "status": "reading"}""",
                """
                {"title": "t", "author": "a", "tag": "x", "wiki": "w", "status": "finished"}""",
                """
                {"title": "t", "author": "a", "tag": "x", "wiki": "w", "status": "finished", "rating": 11}""",
                """
                {"title": "t", "author": "a", "tag": "x", "wiki": "w", "status": "finished", "rating": 0}"""
        })
        void rejectsInvalidValues(String body) throws Exception {
            Book saved = save(BookStatus.NEW);

            update(saved.getId(), body)
                    .andExpect(status().isBadRequest());

            assertEquals("title", bookRepository.findById(saved.getId()).orElseThrow().getTitle());
        }
    }

    @Nested
    class StartBook {

        @Test
        void startsNewBook() throws Exception {
            Book book = save(BookStatus.NEW);

            mockMvc.perform(patch("/api/books/{id}/start", book.getId()).with(admin()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("progress"));

            assertEquals(BookStatus.PROGRESS, bookRepository.findById(book.getId()).orElseThrow().getStatus());
        }

        @ParameterizedTest
        @EnumSource(value = BookStatus.class, names = {"PROGRESS", "FINISHED"})
        void returns409WhenNotNew(BookStatus status) throws Exception {
            Book book = save(status);

            mockMvc.perform(patch("/api/books/{id}/start", book.getId()).with(admin()))
                    .andExpect(status().isConflict())
                    .andExpect(content().contentType(MediaType.APPLICATION_PROBLEM_JSON));
        }

        @Test
        void returns404WhenMissing() throws Exception {
            mockMvc.perform(patch("/api/books/{id}/start", MISSING_ID).with(admin()))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    class FinishBook {

        @Test
        void finishesBookInProgress() throws Exception {
            Book book = save(BookStatus.PROGRESS);

            mockMvc.perform(patch("/api/books/{id}/finish", book.getId()).with(admin())
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

            mockMvc.perform(patch("/api/books/{id}/finish", book.getId()).with(admin())
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

            mockMvc.perform(patch("/api/books/{id}/finish", book.getId()).with(admin())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.errors.rating").isNotEmpty());
        }

        @ParameterizedTest
        @EnumSource(value = BookStatus.class, names = {"NEW", "FINISHED"})
        void returns409WhenNotInProgress(BookStatus status) throws Exception {
            Book book = save(status);

            mockMvc.perform(patch("/api/books/{id}/finish", book.getId()).with(admin())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    {"rating": 7}"""))
                    .andExpect(status().isConflict());
        }

        @Test
        void returns404WhenMissing() throws Exception {
            mockMvc.perform(patch("/api/books/{id}/finish", MISSING_ID).with(admin())
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

            mockMvc.perform(delete("/api/books/{id}", book.getId()).with(admin()))
                    .andExpect(status().isOk());

            assertFalse(bookRepository.existsById(book.getId()));

            mockMvc.perform(get("/api/books/{id}", book.getId()))
                    .andExpect(status().isNotFound());
        }

        @Test
        void returns404WhenMissing() throws Exception {
            mockMvc.perform(delete("/api/books/{id}", MISSING_ID).with(admin()))
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
