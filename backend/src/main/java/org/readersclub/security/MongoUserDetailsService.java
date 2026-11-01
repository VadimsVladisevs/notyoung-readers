package org.readersclub.security;

import lombok.RequiredArgsConstructor;
import org.readersclub.model.User;
import org.readersclub.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.List;
import java.util.Objects;

/**
 * Loads users from Mongo {@code users}; each role becomes an authority {@code ROLE_<role>}.
 * Read-only on purpose: no {@code UserDetailsPasswordService}, so a login never rewrites the stored hash.
 */
@RequiredArgsConstructor
class MongoUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("No such user"));

        return org.springframework.security.core.userdetails.User.withUsername(user.username())
                .password(user.password())
                .roles(Objects.requireNonNullElse(user.roles(), List.<String>of()).toArray(String[]::new))
                .build();
    }
}
