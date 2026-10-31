package org.readersclub.api;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.readersclub.IntegrationTest;
import org.readersclub.model.Book;
import org.readersclub.model.BookStatus;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

import java.util.function.Function;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.readersclub.api.factory.BookFactory.createDefaultBook;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class SecurityTests extends IntegrationTest {

    private static final String VALID_BODY = """
            {"title": "t", "author": "a", "image": "images/i.jpg", "tag": "x", "wiki": "w"}
            """;

    private static Stream<Arguments> writeRequests() {
        return Stream.<Function<String, MockHttpServletRequestBuilder>>of(
                id -> post("/api/books/add").contentType(MediaType.APPLICATION_JSON).content(VALID_BODY),
                id -> patch("/api/books/{id}/update", id).contentType(MediaType.APPLICATION_JSON).content("{\"title\": \"changed\"}"),
                id -> patch("/api/books/{id}/start", id),
                id -> patch("/api/books/{id}/finish", id).contentType(MediaType.APPLICATION_JSON).content("{\"rating\": 5}"),
                id -> delete("/api/books/{id}", id),
                id -> post("/api/check-password")
        ).map(Arguments::of);
    }

    private static Stream<Arguments> unauthorizedWrites() {
        return writeRequests().flatMap(args -> Stream.of(
                Arguments.of(args.get()[0], "no header", (RequestPostProcessor) request -> request),
                Arguments.of(args.get()[0], "wrong password", clubPassword("wrong")),
                Arguments.of(args.get()[0], "blank password", clubPassword(" "))));
    }

    @ParameterizedTest(name = "[{index}] {1}")
    @MethodSource("unauthorizedWrites")
    void writesWithoutCorrectPasswordReturn401AndChangeNothing(Function<String, MockHttpServletRequestBuilder> request,
                                                                String description,
                                                                RequestPostProcessor password) throws Exception {
        Book book = bookRepository.save(createDefaultBook(BookStatus.NEW));

        mockMvc.perform(request.apply(book.getId()).with(password))
                .andExpect(status().isUnauthorized())
                .andExpect(content().contentType(MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.title").value("Unauthorized"));

        assertEquals(1, bookRepository.count());
        assertEquals(book.getTitle(), bookRepository.findById(book.getId()).orElseThrow().getTitle());
        assertEquals(BookStatus.NEW, bookRepository.findById(book.getId()).orElseThrow().getStatus());
    }

    @Test
    void writeWithCorrectPasswordSucceeds() throws Exception {
        Book book = bookRepository.save(createDefaultBook(BookStatus.NEW));

        mockMvc.perform(patch("/api/books/{id}/start", book.getId()).with(clubPassword()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("progress"));
    }

    @Test
    void readsNeedNoPassword() throws Exception {
        Book book = bookRepository.save(createDefaultBook(BookStatus.NEW));

        mockMvc.perform(get("/api/books")).andExpect(status().isOk());
        mockMvc.perform(get("/api/books/{id}", book.getId())).andExpect(status().isOk());
        mockMvc.perform(get("/api/books/random")).andExpect(status().isOk());
        mockMvc.perform(get("/api/statistics")).andExpect(status().isOk());
    }

    @Test
    void authenticatedWriteCreatesNoSession() throws Exception {
        Book book = bookRepository.save(createDefaultBook(BookStatus.NEW));

        mockMvc.perform(patch("/api/books/{id}/start", book.getId()).with(clubPassword()))
                .andExpect(status().isOk())
                .andExpect(header().doesNotExist(HttpHeaders.SET_COOKIE))
                .andExpect(request().sessionAttributeDoesNotExist("SPRING_SECURITY_CONTEXT"));
    }

    @Test
    void crossOriginRequestGetsNoCorsHeaders() throws Exception {
        mockMvc.perform(get("/api/books").header(HttpHeaders.ORIGIN, "https://evil.example"))
                .andExpect(header().doesNotExist(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN));
    }
}
