package org.readersclub.configuration;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;
import org.springframework.context.annotation.Configuration;

import static org.assertj.core.api.Assertions.assertThat;

class PasswordPropertiesTests {

    private final ApplicationContextRunner runner = new ApplicationContextRunner()
            .withUserConfiguration(Config.class);

    @Configuration
    @EnableConfigurationProperties(PasswordProperties.class)
    static class Config {
    }

    @ParameterizedTest
    @ValueSource(strings = {"any", "hxBayM0QPqRtgGtmSBx/Tg==", "$2a$04$tooShort"})
    void failsOnNonBcryptHash(String hash) {
        runner.withPropertyValues("readers-club.password-hash=" + hash)
                .run(context -> assertThat(context).hasFailed());
    }

    @Test
    void failsWithoutHash() {
        runner.run(context -> assertThat(context).hasFailed());
    }

    @Test
    void acceptsBcryptHash() {
        runner.withPropertyValues("readers-club.password-hash=$2b$04$rpg8KQmf0SVyA4SVAOLSTu2WdG6QnOltCJAmPOYI4GyVZhL2YUV3C")
                .run(context -> assertThat(context).hasNotFailed());
    }
}
