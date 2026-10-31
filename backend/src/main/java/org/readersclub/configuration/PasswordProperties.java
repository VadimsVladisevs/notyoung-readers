package org.readersclub.configuration;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import org.springframework.validation.annotation.Validated;

@Getter
@Setter
@Component
@Validated
@ConfigurationProperties(prefix = "readers-club")
public class PasswordProperties {

    /** bcrypt hash of the club password (env {@code ADMIN_PASSWORD_HASH}). */
    @NotNull
    @Pattern(regexp = "\\$2[aby]\\$\\d{2}\\$[./A-Za-z0-9]{53}", message = "must be a bcrypt hash")
    private String passwordHash;
}
