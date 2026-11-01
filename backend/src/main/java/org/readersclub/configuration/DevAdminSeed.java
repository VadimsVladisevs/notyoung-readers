package org.readersclub.configuration;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.readersclub.model.User;
import org.readersclub.repository.UserRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.util.List;

/** Dev only: creates the login {@code admin} / {@code club-secret} (role ADMIN) when there is no {@code admin} user. */
@Slf4j
@Profile("dev")
@Component
@RequiredArgsConstructor
class DevAdminSeed implements ApplicationRunner {

    static final String USERNAME = "admin";
    // bcrypt hash of "club-secret"
    static final String PASSWORD_HASH = "$2a$04$abDVDCCBrxHefMnW2MlYw.Ur41qnEcwu6CCGLV4vkwsv4/3RJ0eqK";

    private final UserRepository userRepository;

    @Override
    public void run(ApplicationArguments args) {
        if (userRepository.findByUsername(USERNAME).isEmpty()) {
            userRepository.save(new User(null, USERNAME, PASSWORD_HASH, List.of("ADMIN")));
            log.info("Dev: created user '{}' with password 'club-secret'", USERNAME);
        }
    }
}
