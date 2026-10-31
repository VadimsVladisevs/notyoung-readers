package org.readersclub.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.readersclub.service.PasswordService;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * Authenticates a request that carries the correct club password in {@link #HEADER}.
 * A missing or wrong password leaves the request anonymous, so protected endpoints answer 401.
 * Temporary: Phase 9 replaces it with a user login.
 */
@Slf4j
@RequiredArgsConstructor
class ClubPasswordFilter extends OncePerRequestFilter {

    static final String HEADER = "X-Club-Password";

    private final PasswordService passwordService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String password = request.getHeader(HEADER);

        if (password != null) {
            if (passwordService.checkPassword(password)) {
                var authentication = UsernamePasswordAuthenticationToken.authenticated(
                        "club", null, List.of(new SimpleGrantedAuthority("ROLE_CLUB")));
                var context = SecurityContextHolder.createEmptyContext();
                context.setAuthentication(authentication);
                SecurityContextHolder.setContext(context);
            } else {
                log.warn("Wrong club password on {} {}", request.getMethod(), request.getRequestURI());
            }
        }

        chain.doFilter(request, response);
    }
}
