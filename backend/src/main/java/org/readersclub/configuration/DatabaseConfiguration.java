package org.readersclub.configuration;

import com.mongodb.ConnectionString;
import com.mongodb.MongoClientSettings;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import lombok.RequiredArgsConstructor;
import org.readersclub.model.converter.reading.BookStatusReadingConverter;
import org.readersclub.model.converter.writing.BookWritingConverter;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.AbstractMongoClientConfiguration;
import org.springframework.data.mongodb.config.EnableMongoAuditing;
import org.springframework.data.mongodb.core.convert.MongoCustomConversions;

@Configuration
@EnableMongoAuditing
@RequiredArgsConstructor
public class DatabaseConfiguration extends AbstractMongoClientConfiguration {

    private final DatabaseProperties databaseProperties;

    @Override
    protected String getDatabaseName() {
        return databaseProperties.getDatabase();
    }

    @Override
    public MongoClient mongoClient() {
        ConnectionString connectionString = new ConnectionString(databaseProperties.getUri());
        MongoClientSettings mongoClientSettings = MongoClientSettings.builder()
                .applyConnectionString(connectionString)
                .build();

        return MongoClients.create(mongoClientSettings);
    }

    @Override
    protected void configureConverters(MongoCustomConversions.MongoConverterConfigurationAdapter adapter) {
        adapter.registerConverter(new BookWritingConverter());
        adapter.registerConverter(new BookStatusReadingConverter());
    }
}
