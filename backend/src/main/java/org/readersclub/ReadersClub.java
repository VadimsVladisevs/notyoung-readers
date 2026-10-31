package org.readersclub;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.security.autoconfigure.UserDetailsServiceAutoConfiguration;

// No default in-memory user (and no generated password in the log): ClubPasswordFilter authenticates writes
@SpringBootApplication(exclude = UserDetailsServiceAutoConfiguration.class)
public class ReadersClub {
    public static void main(String[] args) {
        SpringApplication.run(ReadersClub.class, args);
        IO.println("Application is started!!");
    }
}
