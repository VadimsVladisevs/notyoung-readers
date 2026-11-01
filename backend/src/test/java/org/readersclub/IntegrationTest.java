package org.readersclub;

import org.bson.Document;
import org.junit.jupiter.api.BeforeEach;
import org.readersclub.repository.BookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

import java.util.List;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Import(TestcontainersConfiguration.class)
public abstract class IntegrationTest {

    protected static final String USERNAME = "admin";
    protected static final String PASSWORD = "club-secret";
    // bcrypt hash of PASSWORD (cost 4 keeps the tests fast)
    protected static final String PASSWORD_HASH = "$2a$04$abDVDCCBrxHefMnW2MlYw.Ur41qnEcwu6CCGLV4vkwsv4/3RJ0eqK";
    protected static final String USERS = "users";

    @Autowired
    protected MockMvc mockMvc;

    @Autowired
    protected BookRepository bookRepository;

    @Autowired
    protected MongoTemplate mongoTemplate;

    @BeforeEach
    void cleanDatabase() {
        bookRepository.deleteAll();
        mongoTemplate.dropCollection(USERS);
        saveUser(USERNAME, PASSWORD_HASH, List.of("ADMIN"));
    }

    /** Saves a user shaped like the legacy `users` documents; {@code roles == null} leaves the field out. */
    protected void saveUser(String username, String passwordHash, List<String> roles) {
        Document user = new Document("username", username).append("password", passwordHash);
        if (roles != null) {
            user.append("roles", roles);
        }
        mongoTemplate.insert(user, USERS);
    }

    /** A mock ADMIN user plus a CSRF token: enough for any write in controller tests. */
    protected static RequestPostProcessor admin() {
        return request -> csrf().postProcessRequest(user(USERNAME).roles("ADMIN").postProcessRequest(request));
    }

    /** Logs in through the real endpoint and returns the session that holds the login. */
    protected MockHttpSession login(String username, String password) throws Exception {
        return (MockHttpSession) mockMvc.perform(post("/api/auth/login").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"username": "%s", "password": "%s"}
                                """.formatted(username, password)))
                .andExpect(status().isOk())
                .andReturn().getRequest().getSession(false);
    }
}
