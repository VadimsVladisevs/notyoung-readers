package org.readersclub.configuration;

import org.readersclub.model.converter.reading.BookStatusReadingConverter;
import org.readersclub.model.converter.writing.BookWritingConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.EnableMongoAuditing;
import org.springframework.data.mongodb.core.convert.MongoCustomConversions;

import java.util.List;

@Configuration
@EnableMongoAuditing
public class MongoConfiguration {

    @Bean
    public MongoCustomConversions mongoCustomConversions() {
        return new MongoCustomConversions(List.of(
                new BookWritingConverter(),
                new BookStatusReadingConverter()));
    }
}
