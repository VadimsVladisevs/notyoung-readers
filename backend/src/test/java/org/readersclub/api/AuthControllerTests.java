package org.readersclub.api;

import org.bson.Document;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.readersclub.IntegrationTest;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import java.util.List;

import static org.hamcrest.Matchers.not;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class AuthControllerTests extends IntegrationTest {

    // bcrypt hash of "club-secret" with the $2b$ prefix written by the legacy Node bcrypt library
    private static final String HASH_2B = "$2b$04$rpg8KQmf0SVyA4SVAOLSTu2WdG6QnOltCJAmPOYI4GyVZhL2YUV3C";

    private static MockHttpServletRequestBuilder loginRequest(String body) {
        return post("/api/auth/login").contentType(MediaType.APPLICATION_JSON).content(body);
    }

    private static String credentials(String username, String password) {
        return """
                {"username": "%s", "password": "%s"}
                """.formatted(username, password);
    }

    @Test
    void loginReturnsUserAndStoresItInTheSession() throws Exception {
        mockMvc.perform(loginRequest(credentials(USERNAME, PASSWORD)).with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value(USERNAME))
                .andExpect(jsonPath("$.roles[0]").value("ADMIN"))
                .andExpect(jsonPath("$.password").doesNotExist())
                .andExpect(request().sessionAttribute("SPRING_SECURITY_CONTEXT", not((Object) null)));
    }

    @Test
    void loginChangesTheSessionId() throws Exception {
        MockHttpSession before = new MockHttpSession();
        String oldId = before.getId();

        // A browser sends a valid session cookie; MockMvc marks a passed-in session id invalid unless told otherwise
        MockHttpSession after = (MockHttpSession) mockMvc.perform(loginRequest(credentials(USERNAME, PASSWORD))
                        .session(before).with(csrf())
                        .with(request -> {
                            request.setRequestedSessionIdValid(true);
                            return request;
                        }))
                .andExpect(status().isOk())
                .andReturn().getRequest().getSession(false);

        assertNotEquals(oldId, after.getId());
    }

    @Test
    void loginAcceptsLegacy2bHash() throws Exception {
        saveUser("legacy", HASH_2B, List.of("ADMIN"));

        mockMvc.perform(loginRequest(credentials("legacy", PASSWORD)).with(csrf()))
                .andExpect(status().isOk());
    }

    @Test
    void loginNeverChangesTheUserDocument() throws Exception {
        Query admin = Query.query(Criteria.where("username").is(USERNAME));
        Document before = mongoTemplate.findOne(admin, Document.class, USERS);

        login(USERNAME, PASSWORD);

        assertEquals(before, mongoTemplate.findOne(admin, Document.class, USERS));
    }

    @ParameterizedTest
    @ValueSource(strings = {"wrong", "Club-secret"})
    void wrongPasswordReturns401(String password) throws Exception {
        mockMvc.perform(loginRequest(credentials(USERNAME, password)).with(csrf()))
                .andExpect(status().isUnauthorized())
                .andExpect(content().contentType(MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(request().sessionAttributeDoesNotExist("SPRING_SECURITY_CONTEXT"));
    }

    @Test
    void unknownUserReturns401() throws Exception {
        mockMvc.perform(loginRequest(credentials("nobody", PASSWORD)).with(csrf()))
                .andExpect(status().isUnauthorized())
                .andExpect(content().contentType(MediaType.APPLICATION_PROBLEM_JSON));
    }

    @ParameterizedTest
    @ValueSource(strings = {"{}", "{\"username\": \"admin\"}", "{\"username\": \" \", \"password\": \"x\"}"})
    void missingCredentialsReturn400(String body) throws Exception {
        mockMvc.perform(loginRequest(body).with(csrf()))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentType(MediaType.APPLICATION_PROBLEM_JSON));
    }

    @Test
    void loginWithoutCsrfTokenReturns403() throws Exception {
        mockMvc.perform(loginRequest(credentials(USERNAME, PASSWORD)))
                .andExpect(status().isForbidden())
                .andExpect(content().contentType(MediaType.APPLICATION_PROBLEM_JSON));
    }

    @Test
    void meReturns401WhenAnonymous() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(content().contentType(MediaType.APPLICATION_PROBLEM_JSON));
    }

    @Test
    void meReturnsTheLoggedInUser() throws Exception {
        MockHttpSession session = login(USERNAME, PASSWORD);

        mockMvc.perform(get("/api/auth/me").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value(USERNAME))
                .andExpect(jsonPath("$.roles[0]").value("ADMIN"));
    }

    @Test
    void logoutEndsTheSession() throws Exception {
        MockHttpSession session = login(USERNAME, PASSWORD);

        mockMvc.perform(post("/api/auth/logout").session(session).with(csrf()))
                .andExpect(status().isNoContent());

        assertTrue(session.isInvalid());
    }

    @Test
    void anonymousLogoutIsHarmless() throws Exception {
        mockMvc.perform(post("/api/auth/logout").with(csrf()))
                .andExpect(status().isNoContent());
    }
}
