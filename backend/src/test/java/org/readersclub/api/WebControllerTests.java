package org.readersclub.api;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.readersclub.IntegrationTest;
import org.springframework.http.MediaType;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class WebControllerTests extends IntegrationTest {

    @Test
    void acceptsCorrectPassword() throws Exception {
        mockMvc.perform(post("/api/check-password").with(clubPassword()))
                .andExpect(status().isOk());
    }

    @ParameterizedTest
    @ValueSource(strings = {"wrong", " ", ""})
    void rejectsWrongOrBlankPassword(String password) throws Exception {
        mockMvc.perform(post("/api/check-password").with(clubPassword(password)))
                .andExpect(status().isUnauthorized())
                .andExpect(content().contentType(MediaType.APPLICATION_PROBLEM_JSON));
    }

    @Test
    void rejectsMissingPassword() throws Exception {
        mockMvc.perform(post("/api/check-password"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void ignoresPasswordFormParam() throws Exception {
        mockMvc.perform(post("/api/check-password").param("password", PASSWORD))
                .andExpect(status().isUnauthorized());
    }
}
