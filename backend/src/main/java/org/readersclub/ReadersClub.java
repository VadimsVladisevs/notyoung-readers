package org.readersclub;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@SpringBootApplication
@EnableMongoRepositories
public class ReadersClub {
    public static void main(String[] args) {
        SpringApplication.run(ReadersClub.class, args);
        IO.println("Application is started!!");
    }
}