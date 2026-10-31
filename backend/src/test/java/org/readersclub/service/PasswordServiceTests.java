package org.readersclub.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.readersclub.configuration.PasswordProperties;

import java.util.stream.Stream;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.is;

class PasswordServiceTests {

    // bcrypt hashes of "club-secret"
    private static final String HASH_2A = "$2a$04$abDVDCCBrxHefMnW2MlYw.Ur41qnEcwu6CCGLV4vkwsv4/3RJ0eqK";
    // $2b$ is the prefix written by the legacy Node bcrypt library
    private static final String HASH_2B = "$2b$04$rpg8KQmf0SVyA4SVAOLSTu2WdG6QnOltCJAmPOYI4GyVZhL2YUV3C";

    private final PasswordService passwordService = passwordService(HASH_2A);

    private static PasswordService passwordService(String hash) {
        var properties = new PasswordProperties();
        properties.setPasswordHash(hash);
        return new PasswordService(properties);
    }

    private static Stream<Arguments> shouldValidatePassword() {
        return Stream.of(
                Arguments.of("", false),
                Arguments.of(null, false),
                Arguments.of("qwerty", false),
                Arguments.of("Club-secret", false),
                Arguments.of("club-secret", true)
        );
    }

    @ParameterizedTest
    @MethodSource
    void shouldValidatePassword(String password, boolean expectedResult) {
        // given - when
        var result = passwordService.checkPassword(password);

        // then
        assertThat(result, is(expectedResult));
    }

    @Test
    void shouldAcceptLegacyNodeBcryptHash() {
        var legacyService = passwordService(HASH_2B);

        assertThat(legacyService.checkPassword("club-secret"), is(true));
        assertThat(legacyService.checkPassword("wrong"), is(false));
    }
}
