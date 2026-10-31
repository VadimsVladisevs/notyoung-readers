package org.readersclub.security;

import org.readersclub.service.PasswordService;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AnonymousAuthenticationFilter;
import org.springframework.web.servlet.HandlerExceptionResolver;

/**
 * Reads are public; every other {@code /api/**} request needs the club password
 * in the {@link ClubPasswordFilter#HEADER} header. Stateless: no session, no cookies, no CSRF.
 * No CORS config: the dev server proxies {@code /api} and prod is same-origin.
 */
@Configuration
public class SecurityConfiguration {

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http, PasswordService passwordService,
                                            @Qualifier("handlerExceptionResolver") HandlerExceptionResolver resolver) {
        return http
                .csrf(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .logout(AbstractHttpConfigurer::disable)
                .requestCache(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.GET, "/api/**").permitAll()
                        .requestMatchers(HttpMethod.HEAD, "/api/**").permitAll()
                        .requestMatchers("/api/**").authenticated()
                        .anyRequest().permitAll())
                // Hand 401s to ApiExceptionHandler so they are ProblemDetails like every other error
                .exceptionHandling(e -> e.authenticationEntryPoint(
                        (request, response, ex) -> resolver.resolveException(request, response, null, ex)))
                .addFilterBefore(new ClubPasswordFilter(passwordService), AnonymousAuthenticationFilter.class)
                .build();
    }
}
