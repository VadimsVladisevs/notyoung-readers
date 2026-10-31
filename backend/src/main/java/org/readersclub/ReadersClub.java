package org.readersclub;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ReadersClub {
    public static void main(String[] args) {
        SpringApplication.run(ReadersClub.class, args);
        IO.println("Application is started!!");
    }
}