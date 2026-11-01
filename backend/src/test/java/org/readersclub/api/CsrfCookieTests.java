package org.readersclub.api;

import org.junit.jupiter.api.Test;
import org.readersclub.repository.UserRepository;
import org.readersclub.security.SecurityConfiguration;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Its own slice context on purpose: once any test uses spring-security-test's {@code csrf()},
 * the shared context's CSRF repository is swapped for a test one that never writes the cookie.
 * Never use {@code csrf()} in this class.
 */
@WebMvcTest(AuthController.class)
@Import(SecurityConfiguration.class)
class CsrfCookieTests {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserRepository userRepository;

    @Test
    void meSetsAJavaScriptReadableCsrfCookie() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(cookie().exists("XSRF-TOKEN"))
                .andExpect(cookie().httpOnly("XSRF-TOKEN", false));
    }
}
