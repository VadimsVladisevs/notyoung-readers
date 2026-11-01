package org.readersclub.security;

import org.readersclub.repository.UserRepository;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.servlet.HandlerExceptionResolver;

/**
 * Reads are public; every other {@code /api/**} request needs a logged-in user with role ADMIN.
 * Login is a server session (see {@code AuthController}); writes also need the CSRF token
 * (cookie {@code XSRF-TOKEN}, header {@code X-XSRF-TOKEN}).
 * No CORS config: the dev server proxies {@code /api} and prod is same-origin.
 */
@Configuration
public class SecurityConfiguration {

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http,
                                            @Qualifier("handlerExceptionResolver") HandlerExceptionResolver resolver) {
        return http
                .csrf(csrf -> csrf.spa())
                .httpBasic(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .logout(AbstractHttpConfigurer::disable)
                .requestCache(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.GET, "/api/**").permitAll()
                        .requestMatchers(HttpMethod.HEAD, "/api/**").permitAll()
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/**").hasRole("ADMIN")
                        .anyRequest().permitAll())
                // Hand 401s and 403s to ApiExceptionHandler so they are ProblemDetails like every other error
                .exceptionHandling(e -> e
                        .authenticationEntryPoint((request, response, ex) -> resolver.resolveException(request, response, null, ex))
                        .accessDeniedHandler((request, response, ex) -> resolver.resolveException(request, response, null, ex)))
                .build();
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        // Reads the legacy $2b$ hashes too
        return new BCryptPasswordEncoder();
    }

    @Bean
    AuthenticationManager authenticationManager(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        var provider = new DaoAuthenticationProvider(new MongoUserDetailsService(userRepository));
        provider.setPasswordEncoder(passwordEncoder);
        return new ProviderManager(provider);
    }
}
