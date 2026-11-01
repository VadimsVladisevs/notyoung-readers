package org.readersclub.model;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.validation.annotation.Validated;

import java.util.Map;

@Getter
@Setter
@Validated
@Builder
@Document("statistics")
public class Statistics {
    private Map<String, Integer> statistics;
}
