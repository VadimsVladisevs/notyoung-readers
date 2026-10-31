package org.readersclub.api;

import org.junit.jupiter.api.Test;
import org.readersclub.security.SecurityConfiguration;
import org.readersclub.service.BookService;
import org.readersclub.service.PasswordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.security.autoconfigure.UserDetailsServiceAutoConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(value = BookController.class, excludeAutoConfiguration = UserDetailsServiceAutoConfiguration.class)
@Import(SecurityConfiguration.class)
class ApiExceptionHandlerTests {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private BookService bookService;

    @MockitoBean
    private PasswordService passwordService;

    @Test
    void unexpectedExceptionReturns500WithoutDetails() throws Exception {
        when(bookService.getAllBooks()).thenThrow(new IllegalStateException("connection to db-host-42 refused"));

        mockMvc.perform(get("/api/books"))
                .andExpect(status().isInternalServerError())
                .andExpect(content().contentType(MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(jsonPath("$.status").value(500))
                .andExpect(content().string(not(containsString("db-host-42"))));
    }
}
