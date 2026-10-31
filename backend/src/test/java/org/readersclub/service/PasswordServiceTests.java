package org.readersclub.service;

import lombok.SneakyThrows;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.readersclub.configuration.PasswordProperties;

import java.util.stream.Stream;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.is;

class PasswordServiceTests {

    private final PasswordService passwordService = new PasswordService(passwordProperties());

    private static PasswordProperties passwordProperties() {
        var properties = new PasswordProperties();
        properties.setPasswordHash("dummy-hash");
        return properties;
    }

    private static Stream<Arguments> shouldValidatePassword() {
        return Stream.of(
                Arguments.of("", false),
                Arguments.of(null, false),
                Arguments.of("qwerty", false)
        );
    }

    @ParameterizedTest
    @MethodSource
    @SneakyThrows
    void shouldValidatePassword(String password, boolean expectedResult) {
        // given - when
        var result = passwordService.checkPassword(password);

        // then
        assertThat(result, is(expectedResult));
    }
}
