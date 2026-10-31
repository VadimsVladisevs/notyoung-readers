package org.readersclub.service;

import org.readersclub.configuration.PasswordProperties;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class PasswordService {

    private final PasswordProperties passwordProperties;
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public PasswordService(PasswordProperties passwordProperties) {
        this.passwordProperties = passwordProperties;
    }

    /** Checks against the bcrypt hash in {@code readers-club.password-hash} ($2a$, $2b$ and $2y$ all work). */
    public boolean checkPassword(String password) {
        if (!StringUtils.hasText(password)) {
            return false;
        }

        return passwordEncoder.matches(password, passwordProperties.getPasswordHash());
    }
}
