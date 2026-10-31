package org.readersclub;

import org.junit.jupiter.api.BeforeEach;
import org.readersclub.repository.BookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

@SpringBootTest(properties = "readers-club.password-hash=" + IntegrationTest.PASSWORD_HASH)
@AutoConfigureMockMvc
@Import(TestcontainersConfiguration.class)
public abstract class IntegrationTest {

    protected static final String PASSWORD = "club-secret";
    // bcrypt hash of PASSWORD (cost 4 keeps the tests fast)
    protected static final String PASSWORD_HASH = "$2a$04$abDVDCCBrxHefMnW2MlYw.Ur41qnEcwu6CCGLV4vkwsv4/3RJ0eqK";
    protected static final String PASSWORD_HEADER = "X-Club-Password";

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

    protected static RequestPostProcessor clubPassword() {
        return clubPassword(PASSWORD);
    }

    protected static RequestPostProcessor clubPassword(String password) {
        return request -> {
            request.addHeader(PASSWORD_HEADER, password);
            return request;
        };
    }
}
