package org.readersclub.api;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.readersclub.IntegrationTest;
import org.readersclub.model.Book;
import org.readersclub.model.BookStatus;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.request.AbstractMockHttpServletRequestBuilder;

import java.util.List;
import java.util.function.Function;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.readersclub.api.factory.BookFactory.createDefaultBook;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class SecurityTests extends IntegrationTest {

    private static final String VALID_BODY = """
            {"title": "t", "author": "a", "tag": "x", "wiki": "w"}
            """;

    private static final String EDIT_BODY = """
            {"title": "changed", "author": "a", "tag": "x", "wiki": "w", "status": "new"}
            """;

    private static Stream<Arguments> writeRequests() {
        return Stream.<Function<String, AbstractMockHttpServletRequestBuilder<?>>>of(
                id -> post("/api/books/add").contentType(MediaType.APPLICATION_JSON).content(VALID_BODY),
                id -> patch("/api/books/{id}/update", id).contentType(MediaType.APPLICATION_JSON).content(EDIT_BODY),
                id -> patch("/api/books/{id}/start", id),
                id -> patch("/api/books/{id}/finish", id).contentType(MediaType.APPLICATION_JSON).content("{\"rating\": 5}"),
                id -> delete("/api/books/{id}", id),
                id -> multipart(HttpMethod.PUT, "/api/books/{id}/cover", id)
                        .file(new MockMultipartFile("file", "c.jpg", MediaType.IMAGE_JPEG_VALUE, new byte[]{(byte) 0xFF, (byte) 0xD8, (byte) 0xFF}))
        ).map(Arguments::of);
    }

    private void assertBookUnchanged(Book book) {
        assertEquals(1, bookRepository.count());
        Book stored = bookRepository.findById(book.getId()).orElseThrow();
        assertEquals(book.getTitle(), stored.getTitle());
        assertEquals(BookStatus.NEW, stored.getStatus());
    }

    @ParameterizedTest
    @MethodSource("writeRequests")
    void anonymousWriteReturns401AndChangesNothing(Function<String, AbstractMockHttpServletRequestBuilder<?>> request) throws Exception {
        Book book = bookRepository.save(createDefaultBook(BookStatus.NEW));

        mockMvc.perform(request.apply(book.getId()).with(csrf()))
                .andExpect(status().isUnauthorized())
                .andExpect(content().contentType(MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.title").value("Unauthorized"));

        assertBookUnchanged(book);
    }

    @ParameterizedTest
    @MethodSource("writeRequests")
    void loggedInWriteWithoutCsrfTokenReturns403(Function<String, AbstractMockHttpServletRequestBuilder<?>> request) throws Exception {
        Book book = bookRepository.save(createDefaultBook(BookStatus.NEW));
        MockHttpSession session = login(USERNAME, PASSWORD);

        mockMvc.perform(request.apply(book.getId()).session(session))
                .andExpect(status().isForbidden())
                .andExpect(content().contentType(MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(jsonPath("$.status").value(403));

        assertBookUnchanged(book);
    }

    @ParameterizedTest
    @MethodSource("writeRequests")
    void userWithoutAdminRoleGets403(Function<String, AbstractMockHttpServletRequestBuilder<?>> request) throws Exception {
        Book book = bookRepository.save(createDefaultBook(BookStatus.NEW));
        saveUser("reader", PASSWORD_HASH, List.of());
        MockHttpSession session = login("reader", PASSWORD);

        mockMvc.perform(request.apply(book.getId()).session(session).with(csrf()))
                .andExpect(status().isForbidden())
                .andExpect(content().contentType(MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(jsonPath("$.status").value(403));

        assertBookUnchanged(book);
    }

    @Test
    void legacyUserWithoutRolesFieldCannotWrite() throws Exception {
        Book book = bookRepository.save(createDefaultBook(BookStatus.NEW));
        saveUser("legacy", PASSWORD_HASH, null);
        MockHttpSession session = login("legacy", PASSWORD);

        mockMvc.perform(patch("/api/books/{id}/start", book.getId()).session(session).with(csrf()))
                .andExpect(status().isForbidden());
    }

    @Test
    void writeAfterLoginSucceeds() throws Exception {
        Book book = bookRepository.save(createDefaultBook(BookStatus.NEW));
        MockHttpSession session = login(USERNAME, PASSWORD);

        mockMvc.perform(patch("/api/books/{id}/start", book.getId()).session(session).with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("progress"));
    }

    @Test
    void adminCanEditAfterLogin() throws Exception {
        Book book = bookRepository.save(createDefaultBook(BookStatus.NEW));
        MockHttpSession session = login(USERNAME, PASSWORD);

        mockMvc.perform(patch("/api/books/{id}/update", book.getId()).session(session).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON).content(EDIT_BODY))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("changed"));
    }

    @Test
    void adminCanDeleteAfterLogin() throws Exception {
        Book book = bookRepository.save(createDefaultBook(BookStatus.NEW));
        MockHttpSession session = login(USERNAME, PASSWORD);

        mockMvc.perform(delete("/api/books/{id}", book.getId()).session(session).with(csrf()))
                .andExpect(status().isOk());

        assertEquals(0, bookRepository.count());
    }

    @Test
    void oldPasswordHeaderNoLongerAuthenticates() throws Exception {
        Book book = bookRepository.save(createDefaultBook(BookStatus.NEW));

        mockMvc.perform(patch("/api/books/{id}/start", book.getId()).with(csrf())
                        .header("X-Club-Password", PASSWORD))
                .andExpect(status().isUnauthorized());

        assertBookUnchanged(book);
    }

    @Test
    void checkPasswordEndpointIsGone() throws Exception {
        mockMvc.perform(post("/api/check-password").with(admin()))
                .andExpect(status().isNotFound());
    }

    @Test
    void readsNeedNoLogin() throws Exception {
        Book book = bookRepository.save(createDefaultBook(BookStatus.NEW));

        mockMvc.perform(get("/api/books")).andExpect(status().isOk());
        mockMvc.perform(get("/api/books/{id}", book.getId())).andExpect(status().isOk());
        mockMvc.perform(get("/api/books/random")).andExpect(status().isOk());
        mockMvc.perform(get("/api/statistics")).andExpect(status().isOk());
    }

    @Test
    void anonymousReadCreatesNoSession() throws Exception {
        mockMvc.perform(get("/api/books"))
                .andExpect(status().isOk())
                .andExpect(request().sessionAttributeDoesNotExist("SPRING_SECURITY_CONTEXT"));
    }

    @Test
    void crossOriginRequestGetsNoCorsHeaders() throws Exception {
        mockMvc.perform(get("/api/books").header(HttpHeaders.ORIGIN, "https://evil.example"))
                .andExpect(header().doesNotExist(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN));
    }
}
