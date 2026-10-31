package org.readersclub.configuration;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "spring.data.mongodb")
public class DatabaseProperties {

    @NotNull
    private String uri;

    @NotNull
    private String database;
}
