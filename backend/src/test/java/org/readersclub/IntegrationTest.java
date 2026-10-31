package org.readersclub;

import org.junit.jupiter.api.BeforeEach;
import org.readersclub.repository.BookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest(properties = "readers-club.password-hash=" + IntegrationTest.PASSWORD_HASH)
@AutoConfigureMockMvc
@Import(TestcontainersConfiguration.class)
public abstract class IntegrationTest {

    protected static final String PASSWORD = "club-secret";
    // PBKDF2 hash of PASSWORD, as produced by PasswordService
    protected static final String PASSWORD_HASH = "hxBayM0QPqRtgGtmSBx/Tg==";

    @Autowired
    protected MockMvc mockMvc;

    @Autowired
    protected BookRepository bookRepository;

    @Autowired
    protected MongoTemplate mongoTemplate;

    @BeforeEach
    void cleanDatabase() {
        bookRepository.deleteAll();
    }
}
